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
    listar_docentes,
    CarreraObligatoriaError,
    FacultadObligatoriaError,
    EspecialidadNoEncontradaError,
    FacultadNoEncontradaError,
    CodigoDuplicadoError,
    DniDuplicadoError,
)
from app.services.audit_service import registrar_auditoria
from app.services.auth_service import usuario_actual


def _serializar_usuario(u):
    id_facultad = None
    facultad_nombre = None
    id_especialidad = None
    especialidad_nombre = None
    ciclo = None
    
    if u.estudiante:
        id_especialidad = u.estudiante.id_especialidad
        especialidad_nombre = u.estudiante.especialidad.nombre if u.estudiante.especialidad else None
        id_facultad = u.estudiante.especialidad.id_facultad if u.estudiante.especialidad else None
        facultad_nombre = u.estudiante.especialidad.facultad.nombre if (u.estudiante.especialidad and u.estudiante.especialidad.facultad) else None
        ciclo = u.estudiante.ciclo
    elif u.docente:
        id_facultad = u.docente.id_facultad
        facultad_nombre = u.docente.facultad.nombre if u.docente.facultad else None

    return UsuarioResponse(
        id_usuario=u.id_usuario,
        username=u.username,
        estado=u.estado,
        id_rol=u.id_rol,
        rol=u.rol.nombre if u.rol else None,
        nombres=u.nombres_efectivos,
        apellidos=u.apellidos_efectivos,
        correo=u.correo_efectivo,
        id_facultad=id_facultad,
        facultad_nombre=facultad_nombre,
        id_especialidad=id_especialidad,
        especialidad_nombre=especialidad_nombre,
        ciclo=ciclo,
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
            body.codigo,
            body.dni,
            body.id_facultad,
            body.id_especialidad,
            ciclo=body.ciclo,
            password=body.password,
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
    except CarreraObligatoriaError:
        return {"msg": "La especialidad/carrera es obligatoria para estudiantes"}, 400
    except FacultadObligatoriaError:
        return {"msg": "La facultad es obligatoria para docentes"}, 400
    except EspecialidadNoEncontradaError:
        return {"msg": "La especialidad indicada no existe"}, 404
    except FacultadNoEncontradaError:
        return {"msg": "La facultad indicada no existe"}, 404
    except CodigoDuplicadoError:
        return {"msg": "El código ingresado ya está asignado a otro registro"}, 409
    except DniDuplicadoError:
        return {"msg": "El DNI ingresado ya está asignado a otro registro"}, 409
    except ValueError as e:
        return {"msg": str(e)}, 400

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


def listar_usuarios_ctrl(page=1, per_page=10, rol=None, nombre=None, id_facultad=None, ciclo=None):
    usuarios, total = listar_usuarios(page, per_page, rol, nombre, id_facultad, ciclo)
    return {
        "usuarios": [_serializar_usuario(u) for u in usuarios],
        "total": total,
        "page": page,
        "per_page": per_page,
        "hay_mas": (page * per_page) < total,
    }, 200


def actualizar_usuario_ctrl(id_usuario, body):
    try:
        usuario = actualizar_usuario(
            id_usuario,
            estado=body.estado,
            id_rol=body.id_rol,
            nombres=body.nombres,
            apellidos=body.apellidos,
            correo=body.correo,
            ciclo=body.ciclo,
        )
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


def _serializar_docente(d):
    # Serializa la información del docente a un diccionario
    return {
        "id_docente": d.id_docente,
        "codigo": d.codigo,
        "dni": d.dni,
        "nombres": d.nombres,
        "apellidos": d.apellidos,
        "correo": d.correo,
        "telefono": d.telefono,
        "categoria": d.categoria,
        "condicion": d.condicion,
        "estado": d.estado,
        "id_facultad": d.id_facultad,
    }


def listar_docentes_ctrl():
    # Obtiene todos los docentes y los serializa
    docentes = listar_docentes()
    return {"docentes": [_serializar_docente(d) for d in docentes]}, 200

