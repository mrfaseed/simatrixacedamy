from datetime import datetime
from src import db


class BlogPost(db.Model):
    __tablename__ = "blog_posts"

    id           = db.Column(db.Integer, primary_key=True)
    title        = db.Column(db.String(200), nullable=False)
    slug         = db.Column(db.String(220), unique=True, nullable=False, index=True)
    excerpt      = db.Column(db.String(400))
    content      = db.Column(db.Text)
    image        = db.Column(db.String(255))
    author       = db.Column(db.String(120), default="Elysium Academy")
    tag          = db.Column(db.String(80))
    is_published = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, full=False):
        data = {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "image": self.image,
            "author": self.author,
            "tag": self.tag,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if full:
            data["content"] = self.content
        return data
