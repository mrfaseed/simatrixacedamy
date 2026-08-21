from datetime import datetime
from src import db


class Enquiry(db.Model):
    __tablename__ = "enquiries"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(120))
    phone      = db.Column(db.String(40), nullable=False)
    course_id  = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=True)
    branch_id  = db.Column(db.Integer, db.ForeignKey("branches.id"), nullable=True)
    message    = db.Column(db.Text)

    # ── Added for the hero-carousel program applications
    # (govt internship / career guidance). Left nullable so
    # existing "contact"/"appointment" enquiries are unaffected. ──
    college    = db.Column(db.String(150), nullable=True)
    address    = db.Column(db.Text, nullable=True)
    degree     = db.Column(db.String(120), nullable=True)

    # contact | appointment | govt_intern | career_guidance
    type       = db.Column(db.String(40), default="contact")
    status     = db.Column(db.String(40), default="new")  # new|contacted|qualified|converted|lost
    assigned_to = db.Column(db.Integer, db.ForeignKey("admins.id"), nullable=True)
    follow_up_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    course = db.relationship("Course", lazy="select")
    branch = db.relationship("Branch", lazy="select")
    assignee = db.relationship("Admin", lazy="select")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "course_id": self.course_id,
            "course_title": self.course.title if self.course else None,
            "branch_id": self.branch_id,
            "branch_name": self.branch.name if self.branch else None,
            "message": self.message,
            "college": self.college,
            "address": self.address,
            "degree": self.degree,
            "type": self.type,
            "status": self.status,
            "assigned_to": self.assigned_to,
            "assigned_name": self.assignee.name if self.assignee else None,
            "follow_up_at": self.follow_up_at.isoformat() if self.follow_up_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }