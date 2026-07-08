import secrets

from app.extensions import db
from app.models.docente import Docente
from app.models.estudiante import Estudiante
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.services.auth_service import hash_password


class UsernameDuplicadoError(Exception):
    pass


class RolNoEncontradoError(Exception):
    pass


class RolDuplicadoError(Exception):
    pass


class UsuarioNoEncontradoError(Exception):
    pass


class EstudianteNoEncontradoError(Exception):
    pass


class DocenteNoEncontradoError(Exception):
    pass


class EstudianteYaTieneUsuarioError(Exception):
    pass


class DocenteYaTieneUsuarioError(Exception):
    pass


class VinculoInvalidoError(Exception):
    pass


def crear_usuario(username, id_rol, id_estudiante=None, id_docente=None, nombres=None, apellidos=None, correo=None):
    if Usuario.query.filter_by(username=username).first():
        raise UsernameDuplicadoError()
    if not db.session.get(Rol, id_rol):
        raise RolNoEncontradoError()
    if id_estudiante is not None and id_docente is not None:
        raise VinculoInvalidoError()

    if id_estudiante is not None:
        if not db.session.get(Estudiante, id_estudiante):
            raise EstudianteNoEncontradoError()
        if Usuario.query.filter_by(id_estudiante=id_estudiante).first():
            raise EstudianteYaTieneUsuarioError()

    if id_docente is not None:
        if not db.session.get(Docente, id_docente):
            raise DocenteNoEncontradoError()
        if Usuario.query.filter_by(id_docente=id_docente).first():
            raise DocenteYaTieneUsuarioError()

    password_temporal = secrets.token_urlsafe(9)
    usuario = Usuario(
        username=username,
        password_hash=hash_password(password_temporal),
        estado="activo",
        id_rol=id_rol,
        id_estudiante=id_estudiante,
        id_docente=id_docente,
        nombres=nombres,
        apellidos=apellidos,
        correo=correo,
    )
    db.session.add(usuario)
    db.session.commit()
    return usuario, password_temporal


def listar_usuarios():
    return Usuario.query.all()


def actualizar_usuario(id_usuario, estado=None, id_rol=None):
    usuario = db.session.get(Usuario, id_usuario)
    if not usuario:
        raise UsuarioNoEncontradoError()
    if id_rol is not None:
        if not db.session.get(Rol, id_rol):
            raise RolNoEncontradoError()
        usuario.id_rol = id_rol
    if estado is not None:
        usuario.estado = estado
    db.session.commit()
    return usuario


def crear_rol(nombre, descripcion=None):
    if Rol.query.filter_by(nombre=nombre).first():
        raise RolDuplicadoError()
    rol = Rol(nombre=nombre, descripcion=descripcion)
    db.session.add(rol)
    db.session.commit()
    return rol


def listar_roles():
    return Rol.query.all()
