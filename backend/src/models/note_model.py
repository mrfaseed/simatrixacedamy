from datetime import datetime
from src import db


class EnquiryNote(db.Model):
    __tablename__ = "enquiry_notes"

    id          = db.Column(db.Integer, primary_key=True)
    enquiry_id  = db.Column(db.Integer, db.ForeignKey("enquiries.id"), nullable=False, index=True)
    admin_id    = db.Column(db.Integer, db.ForeignKey("admins.id"), nullable=True)
    admin_name  = db.Column(db.String(120))
    body        = db.Column(db.Text, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "enquiry_id": self.enquiry_id,
            "admin_id": self.admin_id,
            "admin_name": self.admin_name,
            "body": self.body,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
