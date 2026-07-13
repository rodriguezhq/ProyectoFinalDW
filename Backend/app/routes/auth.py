from flask_openapi3.blueprint import APIBlueprint
from app.Controllers import authController
from app.extensions import limiter, db
from app.schemas.auth_schema import LoginBody, LoginResponse, ProfileResponse, ProfileUpdateBody
from flask_openapi3.models.tag import Tag
from app.schemas.common_schema import MessageResponse

from flask_jwt_extended import jwt_required

auth_tag = Tag(name="Autenticación", description="login y Logout de usuarios")
auth_bp = APIBlueprint("auth", __name__, abp_tags=[auth_tag])


@auth_bp.post(
    "/login",
    summary="Iniciar sesión",
    responses={200: LoginResponse, 401: MessageResponse},
)
@limiter.limit("5 per minute")
def login(body: LoginBody):
    return authController.login(body)


@auth_bp.post("/logout", summary="Cerrar sesión", responses={200: MessageResponse})
def logout():
    return authController.logout()


@auth_bp.post("/refresh", summary="Refrescar token de acceso", responses={200: MessageResponse, 401: MessageResponse})
@jwt_required(refresh=True)
def refresh():
    return authController.refresh()


@auth_bp.get(
    "/profile",
    summary="Obtener perfil del usuario autenticado",
    responses={200: ProfileResponse, 401: MessageResponse},
    security=[{"jwt": []}],
)
@jwt_required()
def obtener_perfil():
    from app.services.auth_service import usuario_actual
    user = usuario_actual()
    if not user:
        return {"msg": "Usuario no encontrado"}, 404
        
    telefono = user.estudiante.telefono if user.estudiante else (user.docente.telefono if user.docente else None)
    ciclo = user.estudiante.ciclo if user.estudiante else None
    return {
        "id_usuario": user.id_usuario,
        "username": user.username,
        "nombres": user.nombres_efectivos,
        "apellidos": user.apellidos_efectivos,
        "correo": user.correo_efectivo,
        "telefono": telefono,
        "rol": user.rol.nombre if user.rol else None,
        "id_estudiante": user.id_estudiante,
        "id_docente": user.id_docente,
        "ciclo": ciclo
    }, 200


@auth_bp.put(
    "/profile",
    summary="Actualizar perfil del usuario autenticado",
    responses={200: ProfileResponse, 400: MessageResponse, 401: MessageResponse, 404: MessageResponse},
    security=[{"jwt": []}],
)
@jwt_required()
def actualizar_perfil(body: ProfileUpdateBody):
    from app.services.auth_service import usuario_actual, verify_password, hash_password
    user = usuario_actual()
    if not user:
        return {"msg": "Usuario no encontrado"}, 404

    # Actualizar contraseña si se proporciona
    if body.password:
        if not body.currentPassword:
            return {"msg": "Debe proporcionar la contraseña actual para cambiarla"}, 400
        if not verify_password(body.currentPassword, user.password_hash):
            return {"msg": "La contraseña actual es incorrecta"}, 400
        user.password_hash = hash_password(body.password)

    # Actualizar teléfono si se proporciona
    if body.telefono is not None:
        if user.estudiante:
            user.estudiante.telefono = body.telefono
        elif user.docente:
            user.docente.telefono = body.telefono
        else:
            return {"msg": "Este usuario no tiene un registro de estudiante o docente vinculado"}, 400

    db.session.commit()

    telefono = user.estudiante.telefono if user.estudiante else (user.docente.telefono if user.docente else None)
    ciclo = user.estudiante.ciclo if user.estudiante else None
    return {
        "id_usuario": user.id_usuario,
        "username": user.username,
        "nombres": user.nombres_efectivos,
        "apellidos": user.apellidos_efectivos,
        "correo": user.correo_efectivo,
        "telefono": telefono,
        "rol": user.rol.nombre if user.rol else None,
        "id_estudiante": user.id_estudiante,
        "id_docente": user.id_docente,
        "ciclo": ciclo
    }, 200

