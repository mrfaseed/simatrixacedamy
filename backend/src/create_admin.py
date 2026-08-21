"""Create or update an admin account.

Run from the backend folder:
    python -m src.create_admin <email> <password> [name]

Idempotent: if the email already exists, its password (and name) are updated.
"""

import sys

from src import create_app, db
from src.models import Admin
from src.utils.security import hash_password


def main():
    if len(sys.argv) < 3:
        print("Usage: python -m src.create_admin <email> <password> [name]")
        sys.exit(1)

    email = sys.argv[1].strip().lower()
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else email.split("@")[0].title()

    app = create_app()
    with app.app_context():
        db.create_all()
        admin = Admin.query.filter_by(email=email).first()
        if admin:
            admin.password_hash = hash_password(password)
            if len(sys.argv) > 3:
                admin.name = name
            action = "updated"
        else:
            admin = Admin(
                name=name,
                email=email,
                password_hash=hash_password(password),
                role="admin",
            )
            db.session.add(admin)
            action = "created"
        db.session.commit()
        print(f"Admin {action}: {email}")


if __name__ == "__main__":
    main()
