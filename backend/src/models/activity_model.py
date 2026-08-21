from datetime import datetime
from src import db


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id         = db.Column(db.Integer, primary_key=True)
    admin_id   = db.Column(db.Integer, nullable=True)
    admin_name = db.Column(db.String(120))
    action     = db.Column(db.String(255), nullable=False)  # human-readable summary
    entity     = db.Column(db.String(80))                   # e.g. "course", "enquiry"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "admin_name": self.admin_name,
            "action": self.action,
            "entity": self.entity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    @staticmethod
    def log(admin, action, entity=None):
        try:
            db.session.add(ActivityLog(
                admin_id=getattr(admin, "id", None) if admin else None,
                admin_name=getattr(admin, "name", None) if admin else None,
                action=action,
                entity=entity,
            ))
            db.session.commit()
        except Exception:
            db.session.rollback()
