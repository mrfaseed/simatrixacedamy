from src import db


class CourseCategory(db.Model):
    __tablename__ = "course_categories"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(120), nullable=False)
    slug        = db.Column(db.String(140), unique=True, nullable=False, index=True)
    description = db.Column(db.Text)
    icon        = db.Column(db.String(60))
    order       = db.Column(db.Integer, default=0)

    courses = db.relationship(
        "Course", backref="category", cascade="all, delete-orphan", lazy="select"
    )

    def to_dict(self, with_courses=False):
        data = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "icon": self.icon,
            "order": self.order,
        }
        if with_courses:
            ordered = sorted(
                [c for c in self.courses if c.is_active],
                key=lambda c: (c.order, c.id),
            )
            data["courses"] = [c.to_dict() for c in ordered]
        return data
