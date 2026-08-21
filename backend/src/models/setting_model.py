from src import db

# Editable site-wide settings as simple key/value pairs.
DEFAULTS = {
    "contact_phone": "096777 81155",
    "contact_phone2": "096777 24437",
    "contact_email": "info@elysiumacademy.org",
    "contact_address": "227, IInd Floor, Church Road, Anna Nagar, Madurai - 625020",
    "whatsapp": "919677781155",
    "social_facebook": "",
    "social_instagram": "",
    "social_youtube": "",
    "social_linkedin": "",
    "hero_title": "Launch your tech career with hands-on training",
    "hero_subtitle": "Industry-aligned courses in programming, full stack, data science, cloud and cybersecurity.",
    # JSON array of hero slides (admin can edit via /api/admin/settings).
    # Each slide should be an object: { key, src, alt, w, h, hotspots, visibleCta }
    # `src` may be a relative upload path like "/src/assets/filename.png".
    "hero_slides": "[]",
}


class Setting(db.Model):
    __tablename__ = "settings"

    key = db.Column(db.String(80), primary_key=True)
    value = db.Column(db.Text)

    @staticmethod
    def as_dict():
        rows = {s.key: s.value for s in Setting.query.all()}
        # merge defaults so the frontend always gets a complete object
        return {**DEFAULTS, **{k: v for k, v in rows.items() if v is not None}}

    @staticmethod
    def bulk_set(data):
        for key, value in (data or {}).items():
            if key not in DEFAULTS:
                continue  # ignore unknown keys
            row = db.session.get(Setting, key)
            if row:
                row.value = value
            else:
                db.session.add(Setting(key=key, value=value))
        db.session.commit()
