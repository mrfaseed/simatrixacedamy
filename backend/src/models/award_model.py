from src import db


class Award(db.Model):
    __tablename__ = "awards"

    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(200), nullable=False)
    issuer      = db.Column(db.String(160))
    year        = db.Column(db.String(10))
    description = db.Column(db.Text)
    image       = db.Column(db.String(255))
    order       = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "issuer": self.issuer,
            "year": self.year,
            "description": self.description,
            "image": self.image,
            "order": self.order,
        }
