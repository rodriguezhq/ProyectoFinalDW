
from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from app.extensions import db
from app.models.docente import Docente
from app.models.estudiante import Estudiante
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


def login_user(correo, password, ip=None):
    """Autentica por correo institucional (case-insensitive, buscando en
    Usuario/Estudiante/Docente) o, alternativamente, por username exacto."""
    correo_norm = (correo or "").strip().lower()
    user = (
        Usuario.query
        .outerjoin(Estudiante, Usuario.id_estudiante == Estudiante.id_estudiante)
        .outerjoin(Docente, Usuario.id_docente == Docente.id_docente)
        .filter(
            db.or_(
                Usuario.username == correo,
                db.func.lower(Usuario.correo) == correo_norm,
                db.func.lower(Estudiante.correo) == correo_norm,
                db.func.lower(Docente.correo) == correo_norm,
            )
        )
        .first()
    )
    if not user or not verify_password(password, user.password_hash):
        registrar_auditoria(
            "login_fallido", "usuario", registro=correo_norm, id_usuario=user.id_usuario if user else None, ip=ip
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
    )
    
    refresh_token = create_refresh_token(
        identity=str(user.id_usuario)
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
            "id_estudiante": user.id_estudiante,
            "id_docente": user.id_docente,
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
    )
    return access_token


def hash_password(password: str):
    return generate_password_hash(password)


def verify_password(password: str, hashed_password: str):
    return check_password_hash(hashed_password, password)
