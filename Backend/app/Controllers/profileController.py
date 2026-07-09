from flask import request
from app.extensions import db
from app.services.auth_service import usuario_actual, hash_password
from app.services.audit_service import registrar_auditoria
from app.schemas.perfil_schema import PerfilResponse

def obtener_perfil_ctrl():
    usuario = usuario_actual()
    if not usuario:
        return {"msg": "Usuario no encontrado"}, 404

    # Obtener teléfono de docente o estudiante si tiene
    telefono = None
    if usuario.estudiante:
        telefono = usuario.estudiante.telefono
    elif usuario.docente:
        telefono = usuario.docente.telefono

    return PerfilResponse(
        id_usuario=usuario.id_usuario,
        username=usuario.username,
        nombres=usuario.nombres_efectivos,
        apellidos=usuario.apellidos_efectivos,
        correo=usuario.correo_efectivo,
        rol=usuario.rol.nombre if usuario.rol else None,
        telefono=telefono
    ).model_dump(), 200

def actualizar_perfil_ctrl(body):
    usuario = usuario_actual()
    if not usuario:
        return {"msg": "Usuario no encontrado"}, 404

    if body.password:
        usuario.password_hash = hash_password(body.password)

    if body.telefono is not None:
        if usuario.estudiante:
            usuario.estudiante.telefono = body.telefono
        elif usuario.docente:
            usuario.docente.telefono = body.telefono

    db.session.commit()

    registrar_auditoria(
        "actualizar_perfil",
        "usuario",
        registro=usuario.id_usuario,
        id_usuario=usuario.id_usuario,
        ip=request.remote_addr,
    )

    # Obtener el teléfono actualizado para la respuesta
    telefono = None
    if usuario.estudiante:
        telefono = usuario.estudiante.telefono
    elif usuario.docente:
        telefono = usuario.docente.telefono

    return PerfilResponse(
        id_usuario=usuario.id_usuario,
        username=usuario.username,
        nombres=usuario.nombres_efectivos,
        apellidos=usuario.apellidos_efectivos,
        correo=usuario.correo_efectivo,
        rol=usuario.rol.nombre if usuario.rol else None,
        telefono=telefono
    ).model_dump(), 200
