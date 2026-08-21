import urllib.parse

from src import db


class Branch(db.Model):
    __tablename__ = "branches"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    city       = db.Column(db.String(80), nullable=False)
    address    = db.Column(db.Text)
    phone      = db.Column(db.String(120))
    email      = db.Column(db.String(120))
    hours      = db.Column(db.String(200))
    map_embed  = db.Column(db.Text)
    is_primary = db.Column(db.Boolean, default=False)
    order      = db.Column(db.Integer, default=0)

    def map_src(self):
 
        if self.map_embed:
            return self.map_embed
        query = self.address or f"{self.name}, {self.city}, Tamil Nadu, India"
        return f"https://maps.google.com/maps?q={urllib.parse.quote(query)}&z=15&output=embed"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "address": self.address,
            "phone": self.phone,
            "email": self.email,
            "hours": self.hours,
            "map_embed": self.map_embed,
            "map_src": self.map_src(),
            "is_primary": self.is_primary,
            "order": self.order,
        }
