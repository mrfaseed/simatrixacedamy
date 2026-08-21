# config.py
import os
from dotenv import load_dotenv

load_dotenv(override=True)


def _bool(name, default="false"):
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")

def _int(name, default="0"):
    val = os.getenv(name, default).strip()
    return int(val) if val else int(default)


class Config:
    DEBUG = _bool("FLASK_DEBUG", "false")
    TESTING = False

    # --- Secrets (override in .env; never commit real values) ---
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    JWT_EXPIRES_HOURS = _int("JWT_EXPIRES_HOURS", "24")

    # --- Database ---
    _db_url = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:Kavi%40123@localhost/simatrix_db",
    )
    if _db_url.startswith("mysql://"):
        _db_url = _db_url.replace("mysql://", "mysql+pymysql://", 1)
        
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = _bool("SESSION_COOKIE_SECURE", "false")

    UPLOAD_FOLDER = os.path.abspath("src/assets")
    SERVE_STATIC_FOLDER = os.path.abspath("src/assets")

    RATELIMIT_ENABLED = _bool("RATELIMIT_ENABLED", "true")
    RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = _int("MAIL_PORT", "587")
    MAIL_USE_TLS = _bool("MAIL_USE_TLS", "true")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM") or os.getenv("MAIL_USERNAME")
    MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME", "Elysium Academy")
    # Where admin alerts are sent (falls back to MAIL_USERNAME)
    ADMIN_ALERT_EMAIL = os.getenv("ADMIN_ALERT_EMAIL") or os.getenv("MAIL_USERNAME")

    SITE_URL = os.getenv("SITE_URL", "http://localhost:5175")
