from flask import Flask

from app.config import config_by_name
from app.extensions import cors, db, jwt, migrate
from app.routes import register_blueprints


def create_app(env="development"):
    app = Flask(__name__)
    app.config.from_object(config_by_name[env])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)

    register_blueprints(app)

    return app
