from datetime import timedelta

from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.usuario import Usuario


def usuario_actual():
    """El Usuario autenticado en la petición actual, segun el JWT.

    Se usa en cualquier Controller que necesite saber "quien esta haciendo
    esta peticion" (matricula, notas, certificados, admin, etc.) sin que
    cada uno reimplemente su propia version.
    """
    id_usuario = int(get_jwt_identity())
    return db.session.get(Usuario, id_usuario)


def login_user(username, password):
    user = Usuario.query.filter_by(username=username).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    if user.estado != "activo":
        return None

    additional_claims = {
        "id_rol": user.id_rol,
        "rol": user.rol.nombre if user.rol else None,
    }
    access_token = create_access_token(
        identity=str(user.id_usuario),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=8),
    )
    
    refresh_token = create_refresh_token(
        identity=str(user.id_usuario), expires_delta=timedelta(days=30)
    )
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id_usuario": user.id_usuario,
            "username": user.username,
            "nombres": user.nombres_efectivos,
            "apellidos": user.apellidos_efectivos,
            "correo": user.correo_efectivo,
            "id_rol": user.id_rol,
            "rol": user.rol.nombre if user.rol else None,
        },
    }


def hash_password(password: str):
    return generate_password_hash(password)


def verify_password(password: str, hashed_password: str):
    return check_password_hash(hashed_password, password)
