from .auth_routes import auth_bp
from .public_routes import public_bp
from .admin_routes import admin_bp


def init_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)

    @app.get("/api/health")
    def health():
        return {"status": 1, "message": "Elysium Academy API running"}
