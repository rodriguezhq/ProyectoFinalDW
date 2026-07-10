from app.routes.admin import admin_bp
from app.routes.auth import auth_bp
from app.routes.courses import courses_bp
from app.routes.enrollment import enrollment_bp
from app.routes.grades import grades_bp
from app.routes.records import records_bp
from app.routes.certificates import certificates_bp
from app.routes.period import period_bp


def register_blueprints(app):
    app.register_api(auth_bp, url_prefix="/api/auth")
    app.register_api(grades_bp, url_prefix="/api/grades")
    app.register_api(records_bp, url_prefix="/api/records")
    app.register_api(enrollment_bp, url_prefix="/api/enrollment")
    app.register_api(courses_bp, url_prefix="/api/courses")
    app.register_api(admin_bp, url_prefix="/api/admin")
    app.register_api(certificates_bp, url_prefix="/api/certificates")
    app.register_api(period_bp, url_prefix="/api/admin/periodos")
