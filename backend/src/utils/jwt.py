import os
import datetime
from functools import wraps

import jwt
from flask import request, jsonify

# Single source of truth for the signing secret + lifetime (from env / config).
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
ALGORITHM = "HS256"
ACCESS_HOURS = int(os.getenv("JWT_EXPIRES_HOURS", "24"))
REFRESH_DAYS = int(os.getenv("JWT_REFRESH_DAYS", "30"))


def generate_jwt_token(userid, is_refresh=False):
    now = datetime.datetime.utcnow()
    expiration = now + (
        datetime.timedelta(days=REFRESH_DAYS)
        if is_refresh
        else datetime.timedelta(hours=ACCESS_HOURS)
    )
    payload = {
        "user_id": userid,
        "type": "refresh" if is_refresh else "access",
        "exp": expiration,
        "iat": now,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt_token(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token is missing"}), 401

        token = token.split(" ")[1] if "Bearer" in token else token
        decoded_payload = decode_jwt_token(token)
        if not decoded_payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(decoded_payload, *args, **kwargs)

    return decorated
