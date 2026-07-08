from datetime import timedelta

from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.usuario import Usuario
from app.services.audit_service import registrar_auditoria


def usuario_actual():
    """El Usuario autenticado en la petición actual, segun el JWT.

    Se usa en cualquier Controller que necesite saber "quien esta haciendo
    esta peticion" (matricula, notas, certificados, admin, etc.) sin que
    cada uno reimplemente su propia version.
    """
    id_usuario = int(get_jwt_identity())
    return db.session.get(Usuario, id_usuario)


def login_user(username, password, ip=None):
    user = Usuario.query.filter_by(username=username).first()
    if not user or not verify_password(password, user.password_hash):
        registrar_auditoria(
            "login_fallido", "usuario", registro=username, id_usuario=user.id_usuario if user else None, ip=ip
        )
        return None
    if user.estado != "activo":
        registrar_auditoria("login_fallido_cuenta_inactiva", "usuario", registro=user.id_usuario, id_usuario=user.id_usuario, ip=ip)
        return None

    registrar_auditoria("login_exitoso", "usuario", registro=user.id_usuario, id_usuario=user.id_usuario, ip=ip)

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


def refresh_user_token(user_id):
    user = db.session.get(Usuario, int(user_id))
    if not user or user.estado != "activo":
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
    return access_token


def hash_password(password: str):
    return generate_password_hash(password)


def verify_password(password: str, hashed_password: str):
    return check_password_hash(hashed_password, password)
