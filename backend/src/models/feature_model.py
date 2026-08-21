from src import db


class Feature(db.Model):
    __tablename__ = "features"

    id          = db.Column(db.Integer, primary_key=True)
    title       = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text)
    icon        = db.Column(db.String(60))
    order       = db.Column(db.Integer, default=0)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "icon": self.icon,
            "order": self.order,
        }
