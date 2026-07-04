from app.routes.auth import auth_bp


def register_blueprints(app):
    """Registra los blueprints de la API."""
    app.register_api(auth_bp, url_prefix="/api/auth")
