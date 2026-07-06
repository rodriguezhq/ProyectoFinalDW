from app.routes.auth import auth_bp
from app.routes.enrollment import enrollment_bp
from app.routes.grades import grades_bp


def register_blueprints(app):
    app.register_api(auth_bp, url_prefix="/api/auth")
    app.register_api(grades_bp, url_prefix="/api/grades")
    app.register_api(enrollment_bp, url_prefix="/api/enrollment")
