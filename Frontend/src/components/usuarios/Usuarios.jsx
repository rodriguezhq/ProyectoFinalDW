import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Usuarios({ rolFiltrado }) {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados del Formulario (Creación y Edición)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [username, setUsername] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [idRol, setIdRol] = useState('');
  const [estado, setEstado] = useState('Activo');

  // Campos específicos para Estudiante y Docente (Obligatorios en creación, bloqueados en edición)
  const [codigoPersona, setCodigoPersona] = useState('');
  const [dniPersona, setDniPersona] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState('');

  // Modal especial de contraseña temporal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [tempUser, setTempUser] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const userRes = await apiFetch(`/api/admin/usuarios`, {
        method: 'GET'
      });
      if (!userRes.ok) throw new Error('Error al cargar los usuarios');
      const userData = await userRes.json();
      setUsuarios(userData.usuarios || []);

      const rolRes = await apiFetch(`/api/admin/roles`, {
        method: 'GET'
      });
      if (rolRes.ok) {
        const rolData = await rolRes.json();
        setRoles(rolData.roles || []);
      }

      const facRes = await apiFetch(`/api/courses/facultades`, { method: 'GET' });
      if (facRes.ok) {
        const facData = await facRes.json();
        setFacultades(facData.facultades || []);
      }

      const espRes = await apiFetch(`/api/courses/especialidades`, { method: 'GET' });
      if (espRes.ok) {
        const espData = await espRes.json();
        setEspecialidades(espData.especialidades || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setUsername('');
    setNombres('');
    setApellidos('');
    setCorreo('');
    
    // Auto-seleccionar el rol actual según el tab seleccionado
    const rolEncontrado = roles.find(r => r.nombre === rolFiltrado);
    setIdRol(rolEncontrado ? String(rolEncontrado.id_rol) : '');
    
    setCodigoPersona('');
    setDniPersona('');
    setIdFacultad('');
    setIdEspecialidad('');
    setEstado('Activo');
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingId(user.id_usuario);
    setUsername(user.username);
    setNombres(user.nombres || '');
    setApellidos(user.apellidos || '');
    setCorreo(user.correo || '');
    setIdRol(String(user.id_rol));
    
    setCodigoPersona('');
    setDniPersona('');
    setIdFacultad(user.id_facultad ? String(user.id_facultad) : '');
    setIdEspecialidad(user.id_especialidad ? String(user.id_especialidad) : '');
    setEstado(user.estado || 'Activo');
    setModalOpen(true);
  };

  // Retorna el nombre del rol seleccionado
  const getSelectedRolName = () => {
    const r = roles.find(rol => rol.id_rol === parseInt(idRol));
    return r ? r.nombre : '';
  };

  const handleFacultadChange = (e) => {
    setIdFacultad(e.target.value);
    setIdEspecialidad(''); // Limpiar especialidad seleccionada al cambiar de facultad
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const rolName = getSelectedRolName();

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

      // Si es Estudiante, agregar campos obligatorios correspondientes
      if (rolName === 'Estudiante') {
        const espIdInt = parseInt(idEspecialidad);
        if (!codigoPersona.trim() || !dniPersona.trim() || isNaN(espIdInt) || espIdInt <= 0) {
          toast.error('El Código, DNI y la Carrera/Especialidad son obligatorios para estudiantes.');
          return;
        }
        payload.codigo = codigoPersona.trim().toUpperCase();
        payload.dni = dniPersona.trim();
        payload.id_especialidad = espIdInt;
      }

      // Si es Docente, agregar campos obligatorios correspondientes
      if (rolName === 'Docente') {
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
        const response = await apiFetch(`/api/admin/usuarios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Error al crear el usuario.');
        }

        const resData = await response.json();
        
        // Cargar contraseña temporal
        setTempUser(resData.username);
        setTempPassword(resData.password_temporal);

        setModalOpen(false);
        setPasswordModalOpen(true);
        fetchData();
      } catch (err) {
        toast.error(err.message);
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

      try {
        const response = await apiFetch(`/api/admin/usuarios/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.msg || 'Error al actualizar el usuario.');
        }

        toast.success('Usuario actualizado con éxito.');
        setModalOpen(false);
        fetchData();
      } catch (err) {
        toast.error(err.message);
      }
    }
  };

  const selectedRolName = getSelectedRolName();
  const usuariosFiltrados = usuarios.filter(user => !rolFiltrado || user.rol === rolFiltrado);

  const especialidadesFiltradas = especialidades.filter(
    esp => esp.id_facultad === parseInt(idFacultad)
  );

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
              👤 Cuentas de {rolFiltrado ? `${rolFiltrado}s` : 'Usuario'}
            </h3>
            <p className="text-[0.88rem] text-text-muted">
              Listado y gestión de credenciales, accesos y estado para {rolFiltrado ? `usuarios con rol ${rolFiltrado}` : 'todas las cuentas'}.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + Agregar {rolFiltrado || 'Usuario'}
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando usuarios...</p>
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay usuarios registrados con el rol de {rolFiltrado || 'usuario'} en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Usuario</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombres y Apellidos</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Correo Electrónico</th>
                    {rolFiltrado === 'Estudiante' && (
                      <>
                        <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad</th>
                        <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Carrera</th>
                      </>
                    )}
                    {rolFiltrado === 'Docente' && (
                      <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Facultad</th>
                    )}
                    {!rolFiltrado && (
                      <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Rol</th>
                    )}
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Estado</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usuariosFiltrados.map((user) => (
                    <tr key={user.id_usuario} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-bold text-primary">{user.username}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">
                        {user.nombres || user.apellidos ? `${user.nombres || ''} ${user.apellidos || ''}`.trim() : '-'}
                      </td>
                      <td className="p-4 text-[0.88rem] text-text-muted font-medium">{user.correo || '-'}</td>
                      {rolFiltrado === 'Estudiante' && (
                        <>
                          <td className="p-4 text-[0.88rem] text-text-muted font-medium">{user.facultad_nombre || '-'}</td>
                          <td className="p-4 text-[0.88rem] font-semibold text-primary">{user.especialidad_nombre || '-'}</td>
                        </>
                      )}
                      {rolFiltrado === 'Docente' && (
                        <td className="p-4 text-[0.88rem] text-text-muted font-medium">{user.facultad_nombre || '-'}</td>
                      )}
                      {!rolFiltrado && (
                        <td className="p-4 text-center text-[0.82rem] font-bold">
                          <span className="inline-block bg-slate-100 text-slate-700 py-0.5 px-2.5 rounded font-mono">
                            {user.rol || 'Sin rol'}
                          </span>
                        </td>
                      )}
                      <td className="p-4 text-center text-[0.82rem] font-bold">
                        <span className={`inline-block py-0.5 px-2.5 rounded ${user.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {user.estado}
                        </span>
                      </td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[480px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? '📝 Editar Cuenta de Usuario' : '👤 Registrar Nuevo Usuario'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                
                {/* Username read-only if editing, editable if creating */}
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

                {/* Rol Selection */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="user-rol" className="text-[0.82rem] font-bold text-text-muted uppercase">Rol de Usuario</label>
                  <select
                    id="user-rol"
                    value={idRol}
                    onChange={(e) => setIdRol(e.target.value)}
                    disabled={!!rolFiltrado}
                    className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem] disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="" disabled>Seleccione un Rol</option>
                    {roles.map(rol => (
                      <option key={rol.id_rol} value={rol.id_rol}>{rol.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Código de Identificación (solo creación) */}
                {!editingId && (selectedRolName === 'Estudiante' || selectedRolName === 'Docente') && (
                  <div className="flex flex-col gap-1.5 animate-slide-up">
                    <label htmlFor="user-codigo-persona" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Código de {selectedRolName}
                    </label>
                    <input
                      id="user-codigo-persona"
                      type="text"
                      value={codigoPersona}
                      onChange={(e) => setCodigoPersona(e.target.value)}
                      placeholder={selectedRolName === 'Estudiante' ? "Ej. 2026100101" : "Ej. D501"}
                      className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                    />
                  </div>
                )}

                {/* DNI (solo creación) */}
                {!editingId && (selectedRolName === 'Estudiante' || selectedRolName === 'Docente') && (
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

                {/* Facultad (Creación obligatoria para Estudiantes y Docentes; Bloqueado en edición) */}
                {(selectedRolName === 'Estudiante' || selectedRolName === 'Docente') && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">
                      Facultad
                    </label>
                    <select
                      id="user-facultad"
                      value={idFacultad}
                      onChange={handleFacultadChange}
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

                {/* Carrera / Especialidad (Creación obligatoria solo para Estudiantes; Bloqueado en edición) */}
                {selectedRolName === 'Estudiante' && (
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

                {/* Estado Selection on Edit */}
                {editingId && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="user-estado" className="text-[0.82rem] font-bold text-text-muted uppercase">Estado de la Cuenta</label>
                    <select
                      id="user-estado"
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="p-2.5 border border-border bg-white rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
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

      {/* Password Modal (Advertencia) */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setPasswordModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[420px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔑
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
            <p className="text-[0.78rem] text-rose-600 font-bold mb-6">
              ⚠️ ¡ADVERTENCIA: Por seguridad, esta contraseña no se volverá a mostrar en el sistema! Copie y guarde esta clave antes de cerrar la ventana.
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
