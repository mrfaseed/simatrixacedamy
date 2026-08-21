from flask import Blueprint, request

from src import db
from src.models import Admin
from src.utils.jwt import generate_jwt_token, token_required
from src.utils.security import verify_password
from src.utils.responses import ok, fail, require_fields

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    missing = require_fields(data, ["email", "password"])
    if missing:
        return fail(f"Missing field: {missing}")

    admin = Admin.query.filter_by(email=data["email"].strip().lower()).first()
    if not admin or not verify_password(data["password"], admin.password_hash):
        return fail("Invalid email or password", status_code=401)

    token = generate_jwt_token(admin.id, is_refresh=True)
    return ok({"token": token, "admin": admin.to_dict()}, message="Login successful")


@auth_bp.get("/me")
@token_required
def me(payload):
    admin = db.session.get(Admin, payload.get("user_id"))
    if not admin:
        return fail("Account not found", status_code=404)
    return ok(admin.to_dict())
