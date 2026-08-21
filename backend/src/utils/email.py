"""Email helpers (Flask-Mail).

All sends are best-effort and asynchronous: if SMTP isn't configured, or a
send fails, the API request is never affected.
"""

import logging
from threading import Thread

from flask import current_app
from flask_mail import Message

from src import mail


def mail_configured():
    cfg = current_app.config
    return bool(cfg.get("MAIL_SERVER") and cfg.get("MAIL_USERNAME") and cfg.get("MAIL_PASSWORD"))


def _send_async(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:  # pragma: no cover
            logging.error(f"Email send failed: {e}")


def send_email(to, subject, html, reply_to=None):
    if not to or not mail_configured():
        return False
    cfg = current_app.config
    app = current_app._get_current_object()
    msg = Message(
        subject=subject,
        recipients=[to] if isinstance(to, str) else list(to),
        html=html,
        sender=(cfg.get("MAIL_FROM_NAME", "Elysium Academy"), cfg.get("MAIL_FROM")),
    )
    if reply_to:
        msg.reply_to = reply_to
    Thread(target=_send_async, args=(app, msg), daemon=True).start()
    return True


# --------------------------------------------------------------- templates
def _shell(title, body):
    return f"""\
<div style="font-family:Inter,Arial,sans-serif;background:#f6f8fc;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:linear-gradient(120deg,#0f1f5c,#1637b4);padding:20px 24px">
      <span style="color:#fff;font-size:18px;font-weight:800">Elysium<span style="color:#fbbf24">Academy</span></span>
    </div>
    <div style="padding:24px">
      <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px">{title}</h2>
      {body}
    </div>
    <div style="padding:16px 24px;background:#f8fafc;color:#94a3b8;font-size:12px">
      Elysium Academy · Madurai · 096777 81155
    </div>
  </div>
</div>"""


def _row(label, value):
    if not value:
        return ""
    return (
        f'<tr><td style="padding:4px 12px 4px 0;color:#64748b;font-size:13px">{label}</td>'
        f'<td style="padding:4px 0;color:#0f172a;font-size:13px;font-weight:600">{value}</td></tr>'
    )


def notify_enquiry(enquiry):
    """Admin alert + student auto-reply for a new enquiry."""
    cfg = current_app.config

    admin_to = cfg.get("ADMIN_ALERT_EMAIL")
    if admin_to:
        details = (
            "<table>"
            + _row("Name", enquiry.name)
            + _row("Phone", enquiry.phone)
            + _row("Email", enquiry.email)
            + _row("Course", enquiry.course_title if hasattr(enquiry, "course_title") else (enquiry.course.title if enquiry.course else None))
            + _row("Type", enquiry.type)
            + _row("Message", enquiry.message)
            + "</table>"
        )
        body = (
            f"<p style='color:#475569;font-size:14px'>A new enquiry just came in:</p>{details}"
            f"<p style='margin-top:16px'><a href='{cfg.get('SITE_URL')}/admin/enquiries' "
            "style='background:#1637b4;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:14px'>Open in admin</a></p>"
        )
        send_email(admin_to, f"New enquiry from {enquiry.name}", _shell("New Enquiry", body), reply_to=enquiry.email)

    if enquiry.email:
        body = (
            f"<p style='color:#475569;font-size:14px'>Hi {enquiry.name},</p>"
            "<p style='color:#475569;font-size:14px'>Thank you for reaching out to Elysium Academy. "
            "Our team has received your enquiry and will contact you shortly.</p>"
            "<p style='color:#475569;font-size:14px'>Meanwhile, feel free to call us at "
            "<b>096777 81155</b> for anything urgent.</p>"
            "<p style='color:#475569;font-size:14px'>Warm regards,<br/>Team Elysium Academy</p>"
        )
        send_email(enquiry.email, "We received your enquiry — Elysium Academy", _shell("Thanks for reaching out!", body))


def notify_review(review):
    """Admin alert when a new public review is posted."""
    cfg = current_app.config
    admin_to = cfg.get("ADMIN_ALERT_EMAIL")
    if not admin_to:
        return
    stars = "★" * int(review.rating or 5) + "☆" * (5 - int(review.rating or 5))
    body = (
        f"<p style='color:#475569;font-size:14px'>A new review was posted:</p>"
        f"<p style='font-size:18px;color:#f59e0b'>{stars}</p>"
        f"<p style='color:#0f172a;font-size:14px'>&ldquo;{review.content}&rdquo;</p>"
        f"<p style='color:#64748b;font-size:13px'>— {review.name}{(' · ' + review.role) if review.role else ''}</p>"
        f"<p style='margin-top:16px'><a href='{cfg.get('SITE_URL')}/admin/testimonials' "
        "style='background:#1637b4;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:14px'>Manage reviews</a></p>"
    )
    send_email(admin_to, f"New review from {review.name}", _shell("New Review", body))
