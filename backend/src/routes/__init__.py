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

    @app.get("/api/seed-db-render")
    def seed_db_render():
        import subprocess
        try:
            # Using -m src.seed ensures Python finds the 'src' module in the path
            result = subprocess.run(["python", "-m", "src.seed"], capture_output=True, text=True)
            return {"status": 1, "message": "Seed triggered", "stdout": result.stdout, "stderr": result.stderr}
        except Exception as e:
            return {"status": 0, "error": str(e)}