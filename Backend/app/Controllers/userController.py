from flask import request

from app.schemas.user_schema import RolResponse, UsuarioCreateResponse, UsuarioResponse
from app.services.admin_service import (
    DocenteNoEncontradoError,
    DocenteYaTieneUsuarioError,
    EstudianteNoEncontradoError,
    EstudianteYaTieneUsuarioError,
    RolDuplicadoError,
    RolNoEncontradoError,
    UsernameDuplicadoError,
    UsuarioNoEncontradoError,
    VinculoInvalidoError,
    actualizar_usuario,
    crear_rol,
    crear_usuario,
    listar_roles,
    listar_usuarios,
)
from app.services.audit_service import registrar_auditoria
from app.services.auth_service import usuario_actual


def _serializar_usuario(u):
    return UsuarioResponse(
        id_usuario=u.id_usuario,
        username=u.username,
        estado=u.estado,
        id_rol=u.id_rol,
        rol=u.rol.nombre if u.rol else None,
        nombres=u.nombres_efectivos,
        apellidos=u.apellidos_efectivos,
        correo=u.correo_efectivo,
    ).model_dump()


def _serializar_rol(r):
    return RolResponse(id_rol=r.id_rol, nombre=r.nombre, descripcion=r.descripcion).model_dump()


def crear_usuario_ctrl(body):
    try:
        usuario, password_temporal = crear_usuario(
            body.username,
            body.id_rol,
            body.id_estudiante,
            body.id_docente,
            body.nombres,
            body.apellidos,
            body.correo,
        )
    except UsernameDuplicadoError:
        return {"msg": "Ese username ya está en uso"}, 409
    except RolNoEncontradoError:
        return {"msg": "El rol indicado no existe"}, 404
    except VinculoInvalidoError:
        return {"msg": "Un usuario no puede vincularse a un estudiante y un docente a la vez"}, 400
    except EstudianteNoEncontradoError:
        return {"msg": "El estudiante indicado no existe"}, 404
    except DocenteNoEncontradoError:
        return {"msg": "El docente indicado no existe"}, 404
    except EstudianteYaTieneUsuarioError:
        return {"msg": "Ese estudiante ya tiene una cuenta de usuario"}, 409
    except DocenteYaTieneUsuarioError:
        return {"msg": "Ese docente ya tiene una cuenta de usuario"}, 409

    actor = usuario_actual()
    registrar_auditoria(
        "crear_usuario", "usuario", registro=usuario.id_usuario, id_usuario=actor.id_usuario, ip=request.remote_addr
    )

    return UsuarioCreateResponse(
        id_usuario=usuario.id_usuario,
        username=usuario.username,
        password_temporal=password_temporal,
        id_rol=usuario.id_rol,
    ).model_dump(), 201


def listar_usuarios_ctrl():
    usuarios = listar_usuarios()
    return {"usuarios": [_serializar_usuario(u) for u in usuarios]}, 200


def actualizar_usuario_ctrl(id_usuario, body):
    try:
        usuario = actualizar_usuario(id_usuario, body.estado, body.id_rol)
    except UsuarioNoEncontradoError:
        return {"msg": "Usuario no encontrado"}, 404
    except RolNoEncontradoError:
        return {"msg": "El rol indicado no existe"}, 404

    actor = usuario_actual()
    registrar_auditoria(
        "actualizar_usuario",
        "usuario",
        registro=usuario.id_usuario,
        id_usuario=actor.id_usuario,
        ip=request.remote_addr,
    )

    return _serializar_usuario(usuario), 200


def crear_rol_ctrl(body):
    try:
        rol = crear_rol(body.nombre, body.descripcion)
    except RolDuplicadoError:
        return {"msg": "Ya existe un rol con ese nombre"}, 409
    return _serializar_rol(rol), 201


def listar_roles_ctrl():
    roles = listar_roles()
    return {"roles": [_serializar_rol(r) for r in roles]}, 200
