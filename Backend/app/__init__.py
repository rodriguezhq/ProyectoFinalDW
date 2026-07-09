from flask_openapi3.openapi import OpenAPI
from flask_openapi3.models.info import Info

from app.config import config_by_name
from app.extensions import cors, db, jwt, limiter, migrate
from app.routes import register_blueprints
from app.utils.error_handlers import registrar_manejador_de_errores


def create_app(env="development"):
    info = Info(title="Sistema Académico API", version="1.0.0")
    security_schemes = {
        "jwt": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"},
        "cookie": {
            "type": "apiKey",
            "in": "cookie",
            "name": "access_token_cookie"
        }
    }
    app = OpenAPI(__name__, info=info, security_schemes=security_schemes)
    app.config.from_object(config_by_name[env])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, supports_credentials=True)
    limiter.init_app(app)

    from app import models  # noqa: F401

    register_blueprints(app)
    registrar_manejador_de_errores(app)

    return app
