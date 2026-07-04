from flask_openapi3.openapi import OpenAPI
from flask_openapi3.models.info import Info

from app.config import config_by_name
from app.extensions import cors, db, jwt, migrate
from app.routes import register_blueprints


def create_app(env="development"):
    info = Info(title="Sistema Académico API", version="1.0.0")
    app = OpenAPI(__name__, info=info)
    app.config.from_object(config_by_name[env])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    from app import models  # noqa: F401

    register_blueprints(app)

    return app
