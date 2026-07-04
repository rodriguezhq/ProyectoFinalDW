from app.routes.auth import auth_bp
from app.openapi import docs_bp


def register_blueprints(app):
    """Registra los blueprints de la API."""
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(docs_bp)
