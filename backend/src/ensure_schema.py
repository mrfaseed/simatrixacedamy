"""Idempotently add columns that create_all() can't add to existing tables.

Run from the backend folder:  python -m src.ensure_schema
"""

from sqlalchemy import text

from src import create_app, db

# (table, column, DDL type) — added only if missing.
COLUMNS = [
    ("enquiries", "assigned_to", "INT NULL"),
    ("enquiries", "follow_up_at", "DATETIME NULL"),
    ("courses", "quiz", "TEXT NULL"),
]


def column_exists(conn, table, column):
    row = conn.execute(
        text(
            "SELECT COUNT(*) FROM information_schema.columns "
            "WHERE table_schema = DATABASE() AND table_name = :t AND column_name = :c"
        ),
        {"t": table, "c": column},
    ).scalar()
    return bool(row)


def main():
    app = create_app()
    with app.app_context():
        db.create_all()  # creates any brand-new tables (notes, activity_logs)
        with db.engine.begin() as conn:
            for table, column, ddl in COLUMNS:
                if column_exists(conn, table, column):
                    print(f"= {table}.{column} already exists")
                else:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}"))
                    print(f"+ added {table}.{column}")
        print("Schema ensured.")


if __name__ == "__main__":
    main()
