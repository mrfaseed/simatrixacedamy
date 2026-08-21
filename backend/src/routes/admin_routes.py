import json
import os
import re
import uuid
from flask import Blueprint, current_app, request
from werkzeug.utils import secure_filename

from datetime import datetime

from src import db
from src.models import (
    CourseCategory, Course, Branch, Testimonial, Feature, Enquiry,
    BlogPost, GalleryImage, Award, Setting, Admin, EnquiryNote, ActivityLog,
)
from src.utils.jwt import token_required
from src.utils.security import hash_password
from src.utils.responses import ok, fail, created, not_found, require_fields


def _admin_from(payload):
    return db.session.get(Admin, payload.get("user_id")) if payload else None


def _is_super(admin):
    return bool(admin and (admin.role or "admin") == "admin")


def _parse_dt(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", ""))
    except (ValueError, AttributeError):
        return None

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "gif", "webp", "svg"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5 MB


@admin_bp.post("/upload")
@token_required
def upload_image(payload):
    if "file" not in request.files:
        return fail("No file provided")
    file = request.files["file"]
    if not file or not file.filename:
        return fail("No file selected")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXT:
        return fail(f"Unsupported file type: .{ext}")

    # Size check (seek to end, then rewind)
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_UPLOAD_BYTES:
        return fail("File too large (max 5 MB)")

    folder = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(folder, exist_ok=True)
    base = secure_filename(file.filename.rsplit(".", 1)[0]) or "image"
    filename = f"{base}_{uuid.uuid4().hex[:10]}.{ext}"
    file.save(os.path.join(folder, filename))

    # Served by the /src/assets/<filename> route in src/__init__.py
    return created({"url": f"/src/assets/{filename}", "filename": filename})


def slugify(value):
    value = (value or "").strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "item"


def unique_slug(model, base, current_id=None):
    slug = base
    i = 2
    while True:
        existing = model.query.filter_by(slug=slug).first()
        if not existing or existing.id == current_id:
            return slug
        slug = f"{base}-{i}"
        i += 1


# ---------------------------------------------------------------- Categories
@admin_bp.get("/categories")
@token_required
def list_categories(payload):
    rows = CourseCategory.query.order_by(CourseCategory.order, CourseCategory.id).all()
    return ok([c.to_dict() for c in rows])


@admin_bp.post("/categories")
@token_required
def create_category(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name"])
    if missing:
        return fail(f"Missing field: {missing}")
    cat = CourseCategory(
        name=data["name"].strip(),
        slug=unique_slug(CourseCategory, slugify(data.get("slug") or data["name"])),
        description=data.get("description"),
        icon=data.get("icon"),
        order=data.get("order", 0),
    )
    db.session.add(cat)
    db.session.commit()
    return created(cat.to_dict())


@admin_bp.put("/categories/<int:cat_id>")
@token_required
def update_category(payload, cat_id):
    cat = db.session.get(CourseCategory, cat_id)
    if not cat:
        return not_found("Category not found")
    data = request.get_json(silent=True) or {}
    if "name" in data:
        cat.name = data["name"].strip()
    if data.get("slug"):
        cat.slug = unique_slug(CourseCategory, slugify(data["slug"]), cat.id)
    for field in ("description", "icon", "order"):
        if field in data:
            setattr(cat, field, data[field])
    db.session.commit()
    return ok(cat.to_dict())


@admin_bp.delete("/categories/<int:cat_id>")
@token_required
def delete_category(payload, cat_id):
    cat = db.session.get(CourseCategory, cat_id)
    if not cat:
        return not_found("Category not found")
    db.session.delete(cat)
    db.session.commit()
    return ok(message="Category deleted")


# ------------------------------------------------------------------- Courses
@admin_bp.get("/courses")
@token_required
def list_courses(payload):
    rows = Course.query.order_by(Course.order, Course.id).all()
    return ok([c.to_dict(with_category=True) for c in rows])


def _apply_course(course, data):
    if "title" in data:
        course.title = data["title"].strip()
    if data.get("slug"):
        course.slug = unique_slug(Course, slugify(data["slug"]), course.id)
    if "category_id" in data:
        course.category_id = data["category_id"]
    for field in ("summary", "description", "duration", "level", "tier", "image",
                  "order"):
        if field in data:
            setattr(course, field, data[field])
    if "is_active" in data:
        course.is_active = bool(data["is_active"])
    if "syllabus" in data:
        syl = data["syllabus"]
        course.syllabus = json.dumps(syl) if not isinstance(syl, str) else syl
    if "quiz" in data:
        quiz = data["quiz"]
        if not isinstance(quiz, list):
            raise ValueError("Quiz must be a list")
        for item in quiz:
            options = item.get("options") if isinstance(item, dict) else None
            answer = item.get("answer") if isinstance(item, dict) else None
            if (
                not item.get("question", "").strip()
                or not isinstance(options, list)
                or len(options) != 4
                or any(not isinstance(option, str) or not option.strip() for option in options)
                or not isinstance(answer, int)
                or not 0 <= answer < 4
            ):
                raise ValueError("Every quiz question needs a question, four choices, and a correct answer")
        course.quiz = json.dumps(quiz)


@admin_bp.post("/courses")
@token_required
def create_course(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["title", "category_id"])
    if missing:
        return fail(f"Missing field: {missing}")
    course = Course(
        category_id=data["category_id"],
        title=data["title"].strip(),
        slug=unique_slug(Course, slugify(data.get("slug") or data["title"])),
    )
    try:
        _apply_course(course, data)
    except ValueError as exc:
        db.session.rollback()
        return fail(str(exc))
    db.session.add(course)
    db.session.commit()
    return created(course.to_dict(with_category=True))


@admin_bp.put("/courses/<int:course_id>")
@token_required
def update_course(payload, course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return not_found("Course not found")
    try:
        _apply_course(course, request.get_json(silent=True) or {})
    except ValueError as exc:
        db.session.rollback()
        return fail(str(exc))
    db.session.commit()
    return ok(course.to_dict(with_category=True))


@admin_bp.delete("/courses/<int:course_id>")
@token_required
def delete_course(payload, course_id):
    course = db.session.get(Course, course_id)
    if not course:
        return not_found("Course not found")
    db.session.delete(course)
    db.session.commit()
    return ok(message="Course deleted")


@admin_bp.get("/branches")
@token_required
def list_branches(payload):
    rows = Branch.query.order_by(Branch.order, Branch.id).all()
    return ok([b.to_dict() for b in rows])


@admin_bp.post("/branches")
@token_required
def create_branch(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "city"])
    if missing:
        return fail(f"Missing field: {missing}")
    branch = Branch(name=data["name"].strip(), city=data["city"].strip())
    _apply_branch(branch, data)
    db.session.add(branch)
    db.session.commit()
    return created(branch.to_dict())


def _apply_branch(branch, data):
    for field in ("name", "city", "address", "phone", "email", "hours",
                  "map_embed", "order"):
        if field in data:
            setattr(branch, field, data[field])
    if "is_primary" in data:
        branch.is_primary = bool(data["is_primary"])


@admin_bp.put("/branches/<int:branch_id>")
@token_required
def update_branch(payload, branch_id):
    branch = db.session.get(Branch, branch_id)
    if not branch:
        return not_found("Branch not found")
    _apply_branch(branch, request.get_json(silent=True) or {})
    db.session.commit()
    return ok(branch.to_dict())


@admin_bp.delete("/branches/<int:branch_id>")
@token_required
def delete_branch(payload, branch_id):
    branch = db.session.get(Branch, branch_id)
    if not branch:
        return not_found("Branch not found")
    db.session.delete(branch)
    db.session.commit()
    return ok(message="Branch deleted")


# --------------------------------------------------------------- Testimonials
@admin_bp.get("/testimonials")
@token_required
def list_testimonials(payload):
    rows = Testimonial.query.order_by(Testimonial.order, Testimonial.id).all()
    return ok([t.to_dict() for t in rows])


@admin_bp.post("/testimonials")
@token_required
def create_testimonial(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "content"])
    if missing:
        return fail(f"Missing field: {missing}")
    t = Testimonial(name=data["name"].strip(), content=data["content"].strip())
    _apply_testimonial(t, data)
    db.session.add(t)
    db.session.commit()
    return created(t.to_dict())


def _apply_testimonial(t, data):
    for field in ("name", "role", "content", "rating", "image", "order"):
        if field in data:
            setattr(t, field, data[field])
    if "is_active" in data:
        t.is_active = bool(data["is_active"])


@admin_bp.put("/testimonials/<int:t_id>")
@token_required
def update_testimonial(payload, t_id):
    t = db.session.get(Testimonial, t_id)
    if not t:
        return not_found("Testimonial not found")
    _apply_testimonial(t, request.get_json(silent=True) or {})
    db.session.commit()
    return ok(t.to_dict())


@admin_bp.delete("/testimonials/<int:t_id>")
@token_required
def delete_testimonial(payload, t_id):
    t = db.session.get(Testimonial, t_id)
    if not t:
        return not_found("Testimonial not found")
    db.session.delete(t)
    db.session.commit()
    return ok(message="Testimonial deleted")


# ------------------------------------------------------------------ Features
@admin_bp.get("/features")
@token_required
def list_features(payload):
    rows = Feature.query.order_by(Feature.order, Feature.id).all()
    return ok([f.to_dict() for f in rows])


@admin_bp.post("/features")
@token_required
def create_feature(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["title"])
    if missing:
        return fail(f"Missing field: {missing}")
    f = Feature(
        title=data["title"].strip(),
        description=data.get("description"),
        icon=data.get("icon"),
        order=data.get("order", 0),
    )
    db.session.add(f)
    db.session.commit()
    return created(f.to_dict())


@admin_bp.put("/features/<int:f_id>")
@token_required
def update_feature(payload, f_id):
    f = db.session.get(Feature, f_id)
    if not f:
        return not_found("Feature not found")
    data = request.get_json(silent=True) or {}
    for field in ("title", "description", "icon", "order"):
        if field in data:
            setattr(f, field, data[field])
    db.session.commit()
    return ok(f.to_dict())


@admin_bp.delete("/features/<int:f_id>")
@token_required
def delete_feature(payload, f_id):
    f = db.session.get(Feature, f_id)
    if not f:
        return not_found("Feature not found")
    db.session.delete(f)
    db.session.commit()
    return ok(message="Feature deleted")


# ----------------------------------------------------------------- Enquiries
@admin_bp.get("/enquiries")
@token_required
def list_enquiries(payload):
    rows = Enquiry.query.order_by(Enquiry.created_at.desc(), Enquiry.id.desc()).all()
    return ok([e.to_dict() for e in rows])


@admin_bp.put("/enquiries/<int:e_id>")
@token_required
def update_enquiry(payload, e_id):
    e = db.session.get(Enquiry, e_id)
    if not e:
        return not_found("Enquiry not found")
    data = request.get_json(silent=True) or {}
    changes = []
    if "status" in data and data["status"] != e.status:
        e.status = data["status"]
        changes.append(f"status → {e.status}")
    if "assigned_to" in data:
        e.assigned_to = data["assigned_to"] or None
        changes.append("reassigned")
    if "follow_up_at" in data:
        e.follow_up_at = _parse_dt(data["follow_up_at"])
        changes.append("follow-up set" if e.follow_up_at else "follow-up cleared")
    db.session.commit()
    if changes:
        ActivityLog.log(_admin_from(payload), f"Enquiry #{e.id} ({e.name}): {', '.join(changes)}", "enquiry")
    return ok(e.to_dict())


@admin_bp.delete("/enquiries/<int:e_id>")
@token_required
def delete_enquiry(payload, e_id):
    e = db.session.get(Enquiry, e_id)
    if not e:
        return not_found("Enquiry not found")
    EnquiryNote.query.filter_by(enquiry_id=e.id).delete()
    db.session.delete(e)
    db.session.commit()
    ActivityLog.log(_admin_from(payload), f"Deleted enquiry from {e.name}", "enquiry")
    return ok(message="Enquiry deleted")


# ------------------------------------------------------------- Enquiry notes
@admin_bp.get("/enquiries/<int:e_id>/notes")
@token_required
def list_notes(payload, e_id):
    rows = (
        EnquiryNote.query.filter_by(enquiry_id=e_id)
        .order_by(EnquiryNote.created_at.desc(), EnquiryNote.id.desc())
        .all()
    )
    return ok([n.to_dict() for n in rows])


@admin_bp.post("/enquiries/<int:e_id>/notes")
@token_required
def create_note(payload, e_id):
    e = db.session.get(Enquiry, e_id)
    if not e:
        return not_found("Enquiry not found")
    data = request.get_json(silent=True) or {}
    body = (data.get("body") or "").strip()
    if not body:
        return fail("Note cannot be empty")
    admin = _admin_from(payload)
    note = EnquiryNote(
        enquiry_id=e_id,
        admin_id=getattr(admin, "id", None),
        admin_name=getattr(admin, "name", None),
        body=body,
    )
    db.session.add(note)
    db.session.commit()
    return created(note.to_dict())


# ------------------------------------------------------------------- Admins
@admin_bp.get("/admins")
@token_required
def list_admins(payload):
    rows = Admin.query.order_by(Admin.id).all()
    return ok([a.to_dict() for a in rows])


@admin_bp.post("/admins")
@token_required
def create_admin(payload):
    if not _is_super(_admin_from(payload)):
        return fail("Only an admin can manage staff", status_code=403)
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "email", "password"])
    if missing:
        return fail(f"Missing field: {missing}")
    email = data["email"].strip().lower()
    if Admin.query.filter_by(email=email).first():
        return fail("An account with that email already exists")
    a = Admin(
        name=data["name"].strip(),
        email=email,
        password_hash=hash_password(data["password"]),
        role=data.get("role", "staff"),
    )
    db.session.add(a)
    db.session.commit()
    ActivityLog.log(_admin_from(payload), f"Added {a.role} {a.name}", "admin")
    return created(a.to_dict())


@admin_bp.put("/admins/<int:a_id>")
@token_required
def update_admin(payload, a_id):
    if not _is_super(_admin_from(payload)):
        return fail("Only an admin can manage staff", status_code=403)
    a = db.session.get(Admin, a_id)
    if not a:
        return not_found("Account not found")
    data = request.get_json(silent=True) or {}
    if "name" in data:
        a.name = data["name"].strip()
    if "role" in data:
        a.role = data["role"]
    if data.get("password"):
        a.password_hash = hash_password(data["password"])
    db.session.commit()
    ActivityLog.log(_admin_from(payload), f"Updated account {a.name}", "admin")
    return ok(a.to_dict())


@admin_bp.delete("/admins/<int:a_id>")
@token_required
def delete_admin(payload, a_id):
    me = _admin_from(payload)
    if not _is_super(me):
        return fail("Only an admin can manage staff", status_code=403)
    if me and me.id == a_id:
        return fail("You cannot delete your own account")
    a = db.session.get(Admin, a_id)
    if not a:
        return not_found("Account not found")
    db.session.delete(a)
    db.session.commit()
    ActivityLog.log(me, f"Removed account {a.name}", "admin")
    return ok(message="Account removed")


# -------------------------------------------------------------- Activity log
@admin_bp.get("/activity")
@token_required
def list_activity(payload):
    rows = ActivityLog.query.order_by(ActivityLog.created_at.desc(), ActivityLog.id.desc()).limit(100).all()
    return ok([r.to_dict() for r in rows])


# ----------------------------------------------------------------- Blog posts
@admin_bp.get("/blog")
@token_required
def list_blog(payload):
    rows = BlogPost.query.order_by(BlogPost.created_at.desc(), BlogPost.id.desc()).all()
    return ok([p.to_dict(full=True) for p in rows])


def _apply_blog(post, data):
    if "title" in data:
        post.title = data["title"].strip()
    if data.get("slug"):
        post.slug = unique_slug(BlogPost, slugify(data["slug"]), post.id)
    for field in ("excerpt", "content", "image", "author", "tag"):
        if field in data:
            setattr(post, field, data[field])
    if "is_published" in data:
        post.is_published = bool(data["is_published"])


@admin_bp.post("/blog")
@token_required
def create_blog(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["title"])
    if missing:
        return fail(f"Missing field: {missing}")
    post = BlogPost(
        title=data["title"].strip(),
        slug=unique_slug(BlogPost, slugify(data.get("slug") or data["title"])),
    )
    _apply_blog(post, data)
    db.session.add(post)
    db.session.commit()
    return created(post.to_dict(full=True))


@admin_bp.put("/blog/<int:post_id>")
@token_required
def update_blog(payload, post_id):
    post = db.session.get(BlogPost, post_id)
    if not post:
        return not_found("Article not found")
    _apply_blog(post, request.get_json(silent=True) or {})
    db.session.commit()
    return ok(post.to_dict(full=True))


@admin_bp.delete("/blog/<int:post_id>")
@token_required
def delete_blog(payload, post_id):
    post = db.session.get(BlogPost, post_id)
    if not post:
        return not_found("Article not found")
    db.session.delete(post)
    db.session.commit()
    return ok(message="Article deleted")


# ------------------------------------------------------------------- Gallery
@admin_bp.get("/gallery")
@token_required
def list_gallery(payload):
    rows = GalleryImage.query.order_by(GalleryImage.order, GalleryImage.id.desc()).all()
    return ok([g.to_dict() for g in rows])


@admin_bp.post("/gallery")
@token_required
def create_gallery(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["image"])
    if missing:
        return fail(f"Missing field: {missing}")
    g = GalleryImage(
        title=data.get("title"),
        image=data["image"],
        category=data.get("category"),
        order=data.get("order", 0),
    )
    db.session.add(g)
    db.session.commit()
    return created(g.to_dict())


@admin_bp.put("/gallery/<int:g_id>")
@token_required
def update_gallery(payload, g_id):
    g = db.session.get(GalleryImage, g_id)
    if not g:
        return not_found("Image not found")
    data = request.get_json(silent=True) or {}
    for field in ("title", "image", "category", "order"):
        if field in data:
            setattr(g, field, data[field])
    db.session.commit()
    return ok(g.to_dict())


@admin_bp.delete("/gallery/<int:g_id>")
@token_required
def delete_gallery(payload, g_id):
    g = db.session.get(GalleryImage, g_id)
    if not g:
        return not_found("Image not found")
    db.session.delete(g)
    db.session.commit()
    return ok(message="Image deleted")


# -------------------------------------------------------------------- Awards
@admin_bp.get("/awards")
@token_required
def list_awards(payload):
    rows = Award.query.order_by(Award.order, Award.id).all()
    return ok([a.to_dict() for a in rows])


def _apply_award(a, data):
    for field in ("title", "issuer", "year", "description", "image", "order"):
        if field in data:
            setattr(a, field, data[field])


@admin_bp.post("/awards")
@token_required
def create_award(payload):
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["title"])
    if missing:
        return fail(f"Missing field: {missing}")
    a = Award(title=data["title"].strip())
    _apply_award(a, data)
    db.session.add(a)
    db.session.commit()
    return created(a.to_dict())


@admin_bp.put("/awards/<int:a_id>")
@token_required
def update_award(payload, a_id):
    a = db.session.get(Award, a_id)
    if not a:
        return not_found("Award not found")
    _apply_award(a, request.get_json(silent=True) or {})
    db.session.commit()
    return ok(a.to_dict())


@admin_bp.delete("/awards/<int:a_id>")
@token_required
def delete_award(payload, a_id):
    a = db.session.get(Award, a_id)
    if not a:
        return not_found("Award not found")
    db.session.delete(a)
    db.session.commit()
    return ok(message="Award deleted")


# ------------------------------------------------------------------ Settings
@admin_bp.get("/settings")
@token_required
def get_settings(payload):
    return ok(Setting.as_dict())


@admin_bp.put("/settings")
@token_required
def update_settings(payload):
    data = request.get_json(silent=True) or {}
    Setting.bulk_set(data)
    return ok(Setting.as_dict(), message="Settings saved")
