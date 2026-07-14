import secrets

from app.extensions import db
from app.models.docente import Docente
from app.models.estudiante import Estudiante
from app.models.especialidad import Especialidad
from app.models.facultad import Facultad
from app.models.rol import Rol
from app.models.usuario import Usuario
from app.services.auth_service import hash_password
from app.utils.pagination import paginar_query


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


class CarreraObligatoriaError(Exception):
    pass


class FacultadObligatoriaError(Exception):
    pass


class EspecialidadNoEncontradaError(Exception):
    pass


class FacultadNoEncontradaError(Exception):
    pass


class CodigoDuplicadoError(Exception):
    pass


class DniDuplicadoError(Exception):
    pass


def crear_usuario(username, id_rol, id_estudiante=None, id_docente=None, nombres=None, apellidos=None, correo=None, codigo=None, dni=None, id_facultad=None, id_especialidad=None, ciclo=None, password=None):
    if Usuario.query.filter_by(username=username).first():
        raise UsernameDuplicadoError()
    rol = db.session.get(Rol, id_rol)
    if not rol:
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

    # Auto-crear Estudiante si rol es Estudiante y no se especificó vinculación manual
    if rol.nombre == "Estudiante" and id_estudiante is None:
        if not id_especialidad:
            raise CarreraObligatoriaError()
        if not codigo or not dni:
            raise ValueError("El código y el DNI son obligatorios")
        if Estudiante.query.filter_by(codigo=codigo).first():
            raise CodigoDuplicadoError()
        if Estudiante.query.filter_by(dni=dni).first():
            raise DniDuplicadoError()
        
        esp = db.session.get(Especialidad, id_especialidad)
        if not esp:
            raise EspecialidadNoEncontradaError()
            
        nuevo_est = Estudiante(
            codigo=codigo,
            dni=dni,
            nombres=nombres or "",
            apellidos=apellidos or "",
            correo=correo,
            estado="activo",
            id_especialidad=id_especialidad,
            ciclo=ciclo if ciclo is not None else 1
        )
        db.session.add(nuevo_est)
        db.session.flush()
        id_estudiante = nuevo_est.id_estudiante

    # Auto-crear Docente si rol es Docente y no se especificó vinculación manual
    if rol.nombre == "Docente" and id_docente is None:
        if not id_facultad:
            raise FacultadObligatoriaError()
        if not codigo or not dni:
            raise ValueError("El código y el DNI son obligatorios")
        if Docente.query.filter_by(codigo=codigo).first():
            raise CodigoDuplicadoError()
        if Docente.query.filter_by(dni=dni).first():
            raise DniDuplicadoError()
            
        fac = db.session.get(Facultad, id_facultad)
        if not fac:
            raise FacultadNoEncontradaError()
            
        nuevo_doc = Docente(
            codigo=codigo,
            dni=dni,
            nombres=nombres or "",
            apellidos=apellidos or "",
            correo=correo,
            estado="activo",
            id_facultad=id_facultad
        )
        db.session.add(nuevo_doc)
        db.session.flush()
        id_docente = nuevo_doc.id_docente

    if password:
        password_temporal = password
    else:
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


def listar_usuarios(page=1, per_page=10, rol=None, nombre=None, id_facultad=None, ciclo=None):
    query = Usuario.query
    if rol:
        query = query.join(Rol).filter(Rol.nombre == rol)
    
    if nombre:
        nombre_patron = f"%{nombre}%"
        query = query.filter(
            Usuario.username.like(nombre_patron) |
            Usuario.nombres.like(nombre_patron) |
            Usuario.apellidos.like(nombre_patron)
        )
        
    if rol == "Estudiante" and (id_facultad or ciclo):
        from app.models.estudiante import Estudiante
        query = query.join(Estudiante, Usuario.id_estudiante == Estudiante.id_estudiante)
        if id_facultad:
            from app.models.especialidad import Especialidad
            query = query.join(Especialidad, Estudiante.id_especialidad == Especialidad.id_especialidad).filter(Especialidad.id_facultad == id_facultad)
        if ciclo:
            query = query.filter(Estudiante.ciclo == ciclo)
            
    elif rol == "Docente" and id_facultad:
        from app.models.docente import Docente
        query = query.join(Docente, Usuario.id_docente == Docente.id_docente).filter(Docente.id_facultad == id_facultad)
        
    query = query.order_by(Usuario.id_usuario.desc())
    return paginar_query(query, page, per_page)


def actualizar_usuario(id_usuario, estado=None, id_rol=None, nombres=None, apellidos=None, correo=None, ciclo=None):
    usuario = db.session.get(Usuario, id_usuario)
    if not usuario:
        raise UsuarioNoEncontradoError()
    if id_rol is not None:
        if not db.session.get(Rol, id_rol):
            raise RolNoEncontradoError()
        usuario.id_rol = id_rol
    if estado is not None:
        usuario.estado = estado
    if nombres is not None:
        usuario.nombres = nombres
    if apellidos is not None:
        usuario.apellidos = apellidos
    if correo is not None:
        usuario.correo = correo
    if ciclo is not None and usuario.estudiante:
        usuario.estudiante.ciclo = ciclo
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


def listar_docentes():
    # Obtiene todos los docentes de la base de datos
    return Docente.query.all()

