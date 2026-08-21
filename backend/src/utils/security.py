"""Password hashing helpers (werkzeug-based, no native bcrypt dependency)."""

from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(plain):
    return generate_password_hash(plain)


def verify_password(plain, hashed):
    if not plain or not hashed:
        return False
    return check_password_hash(hashed, plain)
