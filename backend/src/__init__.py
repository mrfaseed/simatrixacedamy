import logging
from flask import Flask, app, current_app, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from config import Config
from functools import wraps

# from src.middlewares.agent_check import restrict_user_agents
def db_safe(fn):
    @wraps(fn)
    def wrapper(*args,**kwargs):
        try:
            return fn(*args,**kwargs)
        except Exception as e:
            db.session.rollback()
            raise e
    return wrapper

# Extensions (initialised in create_app)
db = SQLAlchemy()
mail = Mail()
limiter = Limiter(key_func=get_remote_address)


def create_app():

    logging.basicConfig(
        level=logging.DEBUG, format="%(asctime)s | %(levelname)s | %(message)s"
    )

    # Create app
    app = Flask(__name__)

    app.config.from_object(Config)
    
    print("CONFIG KEYS:", list(app.config.keys()))
    if 'SQLALCHEMY_DATABASE_URI' not in app.config:
        print("MISSING! Config class dict:", Config.__dict__.keys())

    logging.info("Configuration Success")

    # Handling CORS (allowlist from config; "*" allows all).
    # The SPA authenticates with a Bearer token in localStorage (no cookies),
    # so we do NOT enable credentials — that lets us safely allow "*" and
    # avoids the flask_cors wildcard+credentials edge case that drops the
    # Access-Control-Allow-Origin header on preflight responses.
    cors_origins = app.config.get("CORS_ORIGINS", "*")
    if cors_origins and cors_origins != "*":
        origins = [o.strip() for o in cors_origins.split(",") if o.strip()]
    else:
        origins = "*"
    CORS(app, resources={r"/*": {"origins": origins}})

    # Rate limiting + email
    limiter.init_app(app)
    mail.init_app(app)
    logging.info("Extensions (limiter, mail) Initialized.")

    # Connect the db to app
    db.init_app(app)
    logging.info("DB Initialized Successfully.")

    # Init migration
    migrate = Migrate(app, db)
    logging.info("Migrate Initialized Successfully.")

    # Import routes
    @app.route("/src/assets/<path:filename>")
    def serve_static(filename):
        # Handle cases where the client sends a full URL (e.g. from a stored value)
        # so we can still serve the file even if the path is duplicated.
        if filename.startswith("http://") or filename.startswith("https://"):
            from urllib.parse import urlparse

            parsed = urlparse(filename)
            # parsed.path is like: /src/assets/<filename>
            filename = parsed.path.lstrip("/")

        # If client accidentally includes the assets folder again, strip it.
        if filename.startswith("src/assets/"):
            filename = filename[len("src/assets/"):]

        return send_from_directory(
            current_app.config["SERVE_STATIC_FOLDER"], filename
        )

    from src.routes import init_routes

    init_routes(app)
    logging.info("Routes Initialized Successfully.")

    with app.app_context():
        db.create_all()

    return app
