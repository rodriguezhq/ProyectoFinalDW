import React, { useState } from 'react';
import { toast } from 'sonner';
import { User, Plus, Pencil, X, KeyRound, AlertTriangle } from 'lucide-react';
import { useUsuarios } from '../../hooks/usuarios/useUsuarios';
import Paginacion from '../../components/Paginacion';

export default function Usuarios({ rolFiltrado }) {
  // Consumir estados y funciones del gancho personalizado
  const {
    usuarios,
    roles,
    facultades,
    especialidades,
    estaCargando,
    pagina,
    totalPaginas,
    total,
    irAPagina,
    registrarUsuario,
    modificarUsuarioExistente
  } = useUsuarios(rolFiltrado);

  // Estados del Formulario (Creación y Edición)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [username, setUsername] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [idRol, setIdRol] = useState('');
  const [estado, setEstado] = useState('activo');

  // Campos específicos para Estudiante y Docente (Obligatorios en creación, bloqueados en edición)
  const [codigoPersona, setCodigoPersona] = useState('');
  const [dniPersona, setDniPersona] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');
  const [ciclo, setCiclo] = useState('1');

  // Modal especial de contraseña temporal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const abrirModalAgregar = () => {
    setEditingId(null);
    setUsername('');
    setNombres('');
    setApellidos('');
    setCorreo('');
    
    // Auto-seleccionar el rol actual según la pestaña seleccionada
    const rolEncontrado = roles.find(r => r.nombre === rolFiltrado);
    setIdRol(rolEncontrado ? String(rolEncontrado.id_rol) : '');
    
    setCodigoPersona('');
    setDniPersona('');
    setIdFacultad('');
    setIdEspecialidad('');
    setCiclo('1');
    setEstado('activo');
    setModalOpen(true);
  };

  const abrirModalEditar = (usuario) => {
    setEditingId(usuario.id_usuario);
    setUsername(usuario.username);
    setNombres(usuario.nombres || '');
    setApellidos(usuario.apellidos || '');
    setCorreo(usuario.correo || '');
    setIdRol(String(usuario.id_rol));
    
    setCodigoPersona('');
    setDniPersona('');
    setIdFacultad(usuario.id_facultad ? String(usuario.id_facultad) : '');
    setIdEspecialidad(usuario.id_especialidad ? String(usuario.id_especialidad) : '');
    setCiclo(usuario.ciclo ? String(usuario.ciclo) : '1');
    setEstado(usuario.estado || 'activo');
    setModalOpen(true);
  };

  // Retorna el nombre del rol seleccionado
  const obtenerNombreRolSeleccionado = () => {
    const r = roles.find(rol => rol.id_rol === parseInt(idRol));
    return r ? r.nombre : '';
  };

  const manejarCambioFacultad = (e) => {
    setIdFacultad(e.target.value);
    setIdEspecialidad(''); // Limpiar especialidad seleccionada al cambiar de facultad
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    const nombreRol = obtenerNombreRolSeleccionado();

    if (!editingId) {
      // Creación
      if (!username.trim() || !idRol) {
        toast.error('Nombre de usuario y rol son obligatorios.');
        return;
      }

      const payload = {
        username: username.trim(),
        id_rol: parseInt(idRol),
        nombres: nombres.trim() || null,
        apellidos: apellidos.trim() || null,
        correo: correo.trim() || null
      };

      // Si es Estudiante, agregar campos obligatorios
      if (nombreRol === 'Estudiante') {
        const espIdInt = parseInt(idEspecialidad);
        if (!codigoPersona.trim() || !dniPersona.trim() || isNaN(espIdInt) || espIdInt <= 0) {
          toast.error('El Código, DNI y la Carrera/Especialidad son obligatorios para estudiantes.');
          return;
        }
        payload.codigo = codigoPersona.trim().toUpperCase();
        payload.dni = dniPersona.trim();
        payload.id_especialidad = espIdInt;
        payload.ciclo = parseInt(ciclo);
      }

      // Si es Docente, agregar campos obligatorios
      if (nombreRol === 'Docente') {
        const facIdInt = parseInt(idFacultad);
        if (!codigoPersona.trim() || !dniPersona.trim() || isNaN(facIdInt) || facIdInt <= 0) {
          toast.error('El Código, DNI y la Facultad son obligatorios para docentes.');
          return;
        }
        payload.codigo = codigoPersona.trim().toUpperCase();
        payload.dni = dniPersona.trim();
        payload.id_facultad = facIdInt;
      }

      try {
        const respuesta = await registrarUsuario(payload);
        
        // Cargar contraseña temporal
        setTempUser(respuesta.username);
        setTempPassword(respuesta.password_temporal);

        setModalOpen(false);
        setPasswordModalOpen(true);
      } catch (err) {
        // El error ya es manejado y mostrado por el hook
      }
    } else {
      // Edición
      const payload = {
        estado: estado,
        id_rol: parseInt(idRol),
        nombres: nombres.trim() || null,
        apellidos: apellidos.trim() || null,
        correo: correo.trim() || null
      };

      if (nombreRolSeleccionado === 'Estudiante') {
        payload.ciclo = parseInt(ciclo);
      }

      try {
        await modificarUsuarioExistente(editingId, payload);
        setModalOpen(false);
      } catch (err) {
        // El error ya es manejado y mostrado por el hook
      }
    }
  };

  const nombreRolSeleccionado = obtenerNombreRolSeleccionado();

  const especialidadesFiltradas = especialidades.filter(
    esp => esp.id_facultad === parseInt(idFacultad)
  );

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
              <User size={20} /> {rolFiltrado ? `Cuentas de ${rolFiltrado}s` : 'Cuentas de Usuario'}
            </h3>
            <p className="text-[0.88rem] text-text-muted">
              Listado y gestión de credenciales, accesos y estado para {rolFiltrado ? `usuarios con rol ${rolFiltrado}` : 'todas las cuentas'}.
            </p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            className="flex items-center gap-1.5 bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} /> Agregar {rolFiltrado || 'Usuario'}
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay usuarios registrados con el rol de {rolFiltrado || 'usuario'} en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs text-text-main">
                <thead>
                  <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                    <th className="p-2 border-r border-border/60 text-left">Usuario</th>
                    <th className="p-2 border-r border-border/60 text-left">Nombres y Apellidos</th>
                    <th className="p-2 border-r border-border/60 text-left">Correo Electrónico</th>
                    {rolFiltrado === 'Estudiante' && (
                      <>
                        <th className="p-2 border-r border-border/60 text-left">Facultad</th>
                        <th className="p-2 border-r border-border/60 text-left">Carrera</th>
                        <th className="p-2 border-r border-border/60 text-center w-20">Ciclo</th>
                      </>
                    )}
                    {rolFiltrado === 'Docente' && (
                      <th className="p-2 border-r border-border/60 text-left">Facultad</th>
                    )}
                    {!rolFiltrado && (
                      <th className="p-2 border-r border-border/60 text-center w-28">Rol</th>
                    )}
                    <th className="p-2 border-r border-border/60 text-center w-24">Estado</th>
                    <th className="p-2 text-center w-24">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={usuario.id_usuario} className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                        <td className="p-2 border-r border-border/60 font-mono font-bold text-primary">{usuario.username}</td>
                        <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                          {usuario.nombres || usuario.apellidos ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() : '-'}
                        </td>
                        <td className="p-2 border-r border-border/60 text-text-muted font-medium">{usuario.correo || '-'}</td>
                        {rolFiltrado === 'Estudiante' && (
                          <>
                            <td className="p-2 border-r border-border/60 text-text-muted font-medium">{usuario.facultad_nombre || '-'}</td>
                            <td className="p-2 border-r border-border/60 font-semibold text-primary">{usuario.especialidad_nombre || '-'}</td>
                            <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">{usuario.ciclo ? `${usuario.ciclo}°` : '-'}</td>
                          </>
                        )}
                        {rolFiltrado === 'Docente' && (
                          <td className="p-2 border-r border-border/60 text-text-muted font-medium">{usuario.facultad_nombre || '-'}</td>
                        )}
                        {!rolFiltrado && (
                          <td className="p-2 border-r border-border/60 text-center font-bold">
                            <span className="inline-block bg-slate-100 text-slate-700 py-0.5 px-2 rounded font-mono">
                              {usuario.rol || 'Sin rol'}
                            </span>
                          </td>
                        )}
                        <td className="p-2 border-r border-border/60 text-center font-bold">
                          <span className={`inline-block py-0.5 px-2 rounded ${usuario.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(usuario)}
                            className="flex items-center gap-1 mx-auto text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <Pencil size={12} /> Editar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <Paginacion
                cantidadMostrada={usuarios.length}
                total={total}
                pagina={pagina}
                totalPaginas={totalPaginas}
                irAPagina={irAPagina}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[480px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="flex items-center gap-2 font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? <><Pencil size={18} /> Editar Cuenta de Usuario</> : <><User size={18} /> Registrar Nuevo Usuario</>}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all cursor-pointer focus:outline-none"
              >
                <X size={22} />
              </button>
            </div>
            <form onSubmit={manejarEnvio}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto font-sans">
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-username" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre de Usuario (Login)</label>
                  <input
                    id="user-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!editingId}
                    placeholder="Ej. crudolf"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-nombres" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombres</label>
                  <input
                    id="user-nombres"
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Cristhian"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-apellidos" className="text-[0.82rem] font-bold text-text-muted uppercase">Apellidos</label>
                  <input
                    id="user-apellidos"
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Ej. Rudolf"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-correo" className="text-[0.82rem] font-bold text-text-muted uppercase">Correo Electrónico</label>
                  <input
                    id="user-correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    disabled={!!editingId}
                    placeholder="Ej. crudolf@uncp.edu.pe"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Selección de Rol */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-rol" className="text-[0.82rem] font-bold text-text-muted uppercase">Rol de Usuario</label>
                  <select
                    id="user-rol"
                    value={idRol}
                    onChange={(e) => setIdRol(e.target.value)}
                    disabled={!!rolFiltrado}
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                  >
                    <option value="" disabled>Seleccione un Rol</option>
                    {roles.map(rol => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Código de Identificación (solo creación) */}
                {!editingId && (nombreRolSeleccionado === 'Estudiante' || nombreRolSeleccionado === 'Docente') && (
                  <div className="flex flex-col gap-1.5 animate-slide-up">
                    <label htmlFor="user-codigo-persona" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Código de {nombreRolSeleccionado}
                    </label>
                    <input
                      id="user-codigo-persona"
                      type="text"
                      value={codigoPersona}
                      onChange={(e) => setCodigoPersona(e.target.value)}
                      placeholder={nombreRolSeleccionado === 'Estudiante' ? "Ej. 2026100101" : "Ej. D501"}
                      className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                    />
                  </div>
                )}

                {/* DNI (solo creación) */}
                {!editingId && (nombreRolSeleccionado === 'Estudiante' || nombreRolSeleccionado === 'Docente') && (
                  <div className="flex flex-col gap-1.5 animate-slide-up">
                    <label htmlFor="user-dni-persona" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Documento Nacional de Identidad (DNI)
                    </label>
                    <input
                      id="user-dni-persona"
                      type="text"
                      value={dniPersona}
                      onChange={(e) => setDniPersona(e.target.value)}
                      placeholder="Ej. 74112233"
                      className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                    />
                  </div>
                )}

                {/* Facultad */}
                {(nombreRolSeleccionado === 'Estudiante' || nombreRolSeleccionado === 'Docente') && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Facultad
                    </label>
                    <select
                      id="user-facultad"
                      value={idFacultad}
                      onChange={manejarCambioFacultad}
                      disabled={!!editingId}
                      className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                    >
                      <option value="">-- Seleccione una Facultad --</option>
                      {facultades.map(fac => (
                        <option key={fac.id_facultad} value={fac.id_facultad}>{fac.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Carrera / Especialidad */}
                {nombreRolSeleccionado === 'Estudiante' && (
                  <div className="flex flex-col gap-1.5 animate-slide-up">
                    <label htmlFor="user-carrera" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Carrera / Especialidad
                    </label>
                    <select
                      id="user-carrera"
                      value={idEspecialidad}
                      onChange={(e) => setIdEspecialidad(e.target.value)}
                      disabled={!!editingId || !idFacultad}
                      className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
                    >
                      <option value="">-- Seleccione una Carrera --</option>
                      {especialidadesFiltradas.map(esp => (
                        <option key={esp.id_especialidad} value={esp.id_especialidad}>{esp.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Ciclo (Solo Estudiante) */}
                {nombreRolSeleccionado === 'Estudiante' && (
                  <div className="flex flex-col gap-1.5 animate-slide-up">
                    <label htmlFor="user-ciclo" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Ciclo Académico
                    </label>
                    <select
                      id="user-ciclo"
                      value={ciclo}
                      onChange={(e) => setCiclo(e.target.value)}
                      className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                        <option key={c} value={c}>{c}° Ciclo</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Estado */}
                {editingId && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-estado" className="text-[0.82rem] font-bold text-text-muted uppercase">Estado de la Cuenta</label>
                    <select
                      id="user-estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] cursor-pointer"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </div>
                )}

              </div>
              <div className="p-4 bg-bg-alt border-t border-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
                >
                  {editingId ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Contraseña temporal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPasswordModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[420px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound size={28} />
            </div>
            <h3 className="font-heading font-extrabold text-[1.15rem] text-text-heading mb-2">
              ¡Usuario Creado Exitosamente!
            </h3>
            <p className="text-[0.88rem] text-text-muted mb-6 leading-relaxed">
              El usuario <strong>{tempUser}</strong> ha sido registrado. A continuación se muestra la contraseña temporal única generada para esta cuenta:
            </p>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3.5 mb-6 select-all font-mono font-bold text-[1.1rem] text-primary tracking-wider flex justify-center items-center">
              {tempPassword}
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[0.78rem] text-rose-600 font-bold mb-6">
              <AlertTriangle size={14} className="shrink-0" /> ¡ADVERTENCIA: Por seguridad, esta contraseña no se volverá a mostrar en el sistema! Copie y guarde esta clave antes de cerrar la ventana.
            </p>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 font-bold text-[0.88rem] rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Entendido y Copiado
            </button>
          </div>
        </div>
      )}
    </>
  );
}
