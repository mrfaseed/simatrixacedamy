from flask import Blueprint, request

from src import db, limiter
from src.models import (
    CourseCategory, Course, Branch, Testimonial, Feature, Enquiry,
    BlogPost, GalleryImage, Award, Setting,
)
from src.utils.responses import ok, fail, created, require_fields, not_found
from src.utils.email import notify_enquiry, notify_review

public_bp = Blueprint("public", __name__, url_prefix="/api")

# Maps the "program" key sent by the hero-carousel modal to the
# enquiry `type` stored in the DB. Anything not in here (or no
# "program" at all) falls back to whatever `type` the caller sent,
# defaulting to "contact" — this keeps the existing enquiry form
# working exactly as before.
PROGRAM_TYPE_MAP = {
    "internship": "govt_intern",
    "career-guidance": "career_guidance",
}
PROGRAM_TYPES = set(PROGRAM_TYPE_MAP.values())


@public_bp.get("/site")
def site():
    categories = CourseCategory.query.order_by(
        CourseCategory.order, CourseCategory.id
    ).all()
    features = Feature.query.order_by(Feature.order, Feature.id).all()
    branches = Branch.query.order_by(
        Branch.is_primary.desc(), Branch.order, Branch.id
    ).all()
    testimonials = (
        Testimonial.query.filter_by(is_active=True)
        .order_by(Testimonial.order, Testimonial.id)
        .all()
    )
    settings = Setting.as_dict()
    # hero_slides may be stored as a JSON string in settings; try to parse
    hero_slides = []
    try:
        import json as _json

        raw = settings.get("hero_slides")
        if isinstance(raw, str) and raw.strip():
            hero_slides = _json.loads(raw)
        elif isinstance(raw, list):
            hero_slides = raw
    except Exception:
        hero_slides = []

    return ok(
        {
            "features": [f.to_dict() for f in features],
            "categories": [c.to_dict(with_courses=True) for c in categories],
            "branches": [b.to_dict() for b in branches],
            "testimonials": [t.to_dict() for t in testimonials],
            "settings": settings,
            "hero_slides": hero_slides,
        }
    )


@public_bp.get("/categories")
def categories():
    rows = CourseCategory.query.order_by(CourseCategory.order, CourseCategory.id).all()
    return ok([c.to_dict(with_courses=True) for c in rows])



@public_bp.get("/courses")
def courses():
    query = Course.query.filter_by(is_active=True)
    category_slug = request.args.get("category")
    if category_slug:
        cat = CourseCategory.query.filter_by(slug=category_slug).first()
        if not cat:
            return not_found("Category not found")
        query = query.filter_by(category_id=cat.id)
    rows = query.order_by(Course.order, Course.id).all()
    return ok([c.to_dict(with_category=True) for c in rows])


@public_bp.get("/courses/<slug>")
def course_detail(slug):
    course = Course.query.filter_by(slug=slug).first()
    if not course:
        return not_found("Course not found")
    return ok(course.to_dict(with_category=True))


@public_bp.get("/branches")
def branches():
    rows = Branch.query.order_by(
        Branch.is_primary.desc(), Branch.order, Branch.id
    ).all()
    return ok([b.to_dict() for b in rows])


@public_bp.get("/blog")
def blog_list():
    rows = (
        BlogPost.query.filter_by(is_published=True)
        .order_by(BlogPost.created_at.desc(), BlogPost.id.desc())
        .all()
    )
    return ok([p.to_dict() for p in rows])


@public_bp.get("/blog/<slug>")
def blog_detail(slug):
    post = BlogPost.query.filter_by(slug=slug, is_published=True).first()
    if not post:
        return not_found("Article not found")
    return ok(post.to_dict(full=True))


@public_bp.get("/gallery")
def gallery():
    rows = GalleryImage.query.order_by(GalleryImage.order, GalleryImage.id.desc()).all()
    return ok([g.to_dict() for g in rows])


@public_bp.get("/awards")
def awards():
    rows = Award.query.order_by(Award.order, Award.id).all()
    return ok([a.to_dict() for a in rows])


@public_bp.get("/reviews")
def list_reviews():
    rows = (
        Testimonial.query.filter_by(is_active=True)
        .order_by(Testimonial.order, Testimonial.id.desc())
        .all()
    )
    return ok([t.to_dict() for t in rows])


@public_bp.post("/reviews")
@limiter.limit("5 per hour; 20 per day")
def create_review():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "content"])
    if missing:
        return fail(f"Missing field: {missing}")

    content = (data.get("content") or "").strip()
    if len(content) < 10:
        return fail("Please write a little more about your experience (min 10 characters).")
    if len(content) > 1000:
        return fail("Review is too long (max 1000 characters).")

    try:
        rating = max(1, min(5, int(data.get("rating", 5))))
    except (TypeError, ValueError):
        rating = 5

    review = Testimonial(
        name=data["name"].strip(),
        role=(data.get("role") or "").strip() or None,
        content=data["content"].strip(),
        rating=rating,
        is_active=True,  # published immediately so it shows on the public site
    )
    db.session.add(review)
    db.session.commit()
    notify_review(review)
    return created(
        review.to_dict(),
        message="Thank you! Your review is now live.",
    )


@public_bp.post("/enquiries")
@limiter.limit("8 per hour; 30 per day")
def create_enquiry():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["name", "phone"])
    if missing:
        return fail(f"Missing field: {missing}")

    # "program" (sent by the hero-carousel modal: "internship" or
    # "career-guidance") takes priority over a raw "type" — this is
    # what tags the row as a govt internship / career guidance
    # application instead of a plain contact enquiry.
    program = data.get("program")
    enquiry_type = PROGRAM_TYPE_MAP.get(program, data.get("type", "contact"))

    college = (data.get("college") or "").strip() or None
    address = (data.get("address") or "").strip() or None
    degree = (data.get("degree") or "").strip() or None

    if enquiry_type in PROGRAM_TYPES:
        program_missing = require_fields(data, ["email", "college", "degree"])
        if program_missing:
            return fail(f"Missing field: {program_missing}")

    enquiry = Enquiry(
        name=data["name"].strip(),
        email=(data.get("email") or "").strip() or None,
        phone=data["phone"].strip(),
        course_id=data.get("course_id") or None,
        branch_id=data.get("branch_id") or None,
        message=(data.get("message") or "").strip() or None,
        college=college,
        address=address,
        degree=degree,
        type=enquiry_type,
    )
    db.session.add(enquiry)
    db.session.commit()
    notify_enquiry(enquiry)
    return created(
        enquiry.to_dict(),
        message="Thank you! Our team will reach out to you shortly.",
    )