from datetime import datetime
from src import db


class GalleryImage(db.Model):
    __tablename__ = "gallery_images"

    id         = db.Column(db.Integer, primary_key=True)
    title      = db.Column(db.String(160))
    image      = db.Column(db.String(255), nullable=False)
    category   = db.Column(db.String(80))  # events, classroom, placements...
    order      = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image": self.image,
            "category": self.category,
            "order": self.order,
        }
