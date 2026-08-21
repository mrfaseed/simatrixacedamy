from src import db


class Testimonial(db.Model):
    __tablename__ = "testimonials"

    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String(120), nullable=False)
    role      = db.Column(db.String(160))
    content   = db.Column(db.Text, nullable=False)
    rating    = db.Column(db.Integer, default=5)
    image     = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    order     = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "content": self.content,
            "rating": self.rating,
            "image": self.image,
            "is_active": self.is_active,
            "order": self.order,
        }
