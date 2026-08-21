import json
from src import db


class Course(db.Model):
    __tablename__ = "courses"

    id          = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(
        db.Integer, db.ForeignKey("course_categories.id"), nullable=False
    )
    title       = db.Column(db.String(160), nullable=False)
    slug        = db.Column(db.String(180), unique=True, nullable=False, index=True)
    summary     = db.Column(db.String(300))
    description = db.Column(db.Text)
    duration    = db.Column(db.String(60))
    level       = db.Column(db.String(60))
    tier        = db.Column(db.String(40), default="classic")  # premium | budget | classic
    syllabus    = db.Column(db.Text)  # JSON-encoded list of modules
    quiz        = db.Column(db.Text)  # JSON-encoded list of quiz questions
    image       = db.Column(db.String(255))
    is_active   = db.Column(db.Boolean, default=True)
    order       = db.Column(db.Integer, default=0)

    def get_syllabus(self):
        if not self.syllabus:
            return []
        try:
            modules = json.loads(self.syllabus)
            return modules if isinstance(modules, list) else []
        except (ValueError, TypeError):
            return []

    def get_quiz(self):
        if not self.quiz:
            return []
        try:
            questions = json.loads(self.quiz)
            return questions if isinstance(questions, list) else []
        except (ValueError, TypeError):
            return []

    def to_dict(self, with_category=False):
        data = {
            "id": self.id,
            "category_id": self.category_id,
            "title": self.title,
            "slug": self.slug,
            "summary": self.summary,
            "description": self.description,
            "duration": self.duration,
            "level": self.level,
            "tier": self.tier,
            "syllabus": self.get_syllabus(),
            "quiz": self.get_quiz(),
            "image": self.image,
            "is_active": self.is_active,
            "order": self.order,
        }
        if with_category and self.category:
            data["category"] = {
                "id": self.category.id,
                "name": self.category.name,
                "slug": self.category.slug,
            }
        return data
