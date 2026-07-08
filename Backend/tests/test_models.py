from app.models.usuario import Usuario


def test_nombres_efectivos_usa_estudiante_cuando_usuario_no_tiene_nombre_directo(app):
    with app.app_context():
        user = Usuario.query.filter_by(username="jperez").first()
        assert user.nombres_efectivos == "Juan"
        assert user.apellidos_efectivos == "Perez"
        assert user.correo_efectivo == "juan.perez@test.com"


def test_nombres_efectivos_usa_datos_directos_para_admin(app):
    with app.app_context():
        user = Usuario.query.filter_by(username="admin_test").first()
        assert user.nombres_efectivos == "Rosa"
        assert user.apellidos_efectivos == "Admin"
        assert user.correo_efectivo == "admin@test.com"


def test_nombres_efectivos_es_none_sin_estudiante_docente_ni_nombre_directo(app):
    from app.extensions import db
    with app.app_context():
        empty_user = Usuario(username="empty_test", password_hash="hash", id_rol=1)
        db.session.add(empty_user)
        db.session.commit()
        
        assert empty_user.nombres_efectivos is None
        assert empty_user.apellidos_efectivos is None
        assert empty_user.correo_efectivo is None

        db.session.delete(empty_user)
        db.session.commit()
