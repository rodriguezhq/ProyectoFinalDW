import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { obtenerFacultades, guardarFacultad, actualizarFacultad, eliminarFacultad } from '../../services/servicioAcademico';

export default function Facultades() {
  const [facultades, setFacultades] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Estados del Formulario
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const cargarFacultades = async () => {
    setEstaCargando(true);
    try {
      const datos = await obtenerFacultades();
      setFacultades(datos.facultades || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarFacultades();
  }, []);

  const abrirModalAgregar = () => {
    setEditingId(null);
    setNombre('');
    setCodigo('');
    setModalOpen(true);
  };

  const abrirModalEditar = (fac) => {
    setEditingId(fac.id_facultad);
    setNombre(fac.nombre);
    setCodigo(fac.codigo);
    setModalOpen(true);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !codigo.trim()) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    const payload = {
      nombre: nombre.trim(),
      codigo: codigo.trim().toUpperCase()
    };

    try {
      if (editingId) {
        await actualizarFacultad(editingId, payload);
        toast.success('Facultad actualizada con éxito.');
      } else {
        await guardarFacultad(payload);
        toast.success('Facultad creada con éxito.');
      }
      setModalOpen(false);
      cargarFacultades();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const manejarEliminar = async (id) => {
    try {
      await eliminarFacultad(id);
      toast.success('Facultad eliminada con éxito.');
      cargarFacultades();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🏫 Facultades Universitarias</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de las unidades académicas administrativas de la UNCP.</p>
          </div>
          <button
            type="button"
            onClick={abrirModalAgregar}
            className="bg-primary text-white py-2 px-4 text-[0.88rem] font-bold rounded-md transition-all duration-300 hover:bg-primary-hover shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + Agregar Facultad
          </button>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando facultades...</p>
            </div>
          ) : facultades.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay facultades registradas en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Código</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre de Facultad</th>
                    <th className="p-4 text-center text-[0.85rem] font-heading font-extrabold text-text-heading">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {facultades.map((fac) => (
                    <tr key={fac.id_facultad} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-bold text-primary">{fac.codigo}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{fac.nombre}</td>
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => abrirModalEditar(fac)}
                          className="text-primary hover:text-primary-hover font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-primary-light transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(fac.id_facultad)}
                          className="text-red-600 hover:text-red-700 font-bold text-[0.88rem] px-3 py-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                        >
                          Eliminar
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

      {/* Modal de Agregar / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[450px] w-full overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-primary-light border-b border-primary/10 flex justify-between items-center">
              <h3 className="font-heading font-extrabold text-primary text-[1.1rem]">
                {editingId ? '📝 Editar Facultad' : '🏫 Nueva Facultad'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-text-muted hover:text-primary transition-all text-2xl font-bold cursor-pointer focus:outline-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={manejarEnvio}>
              <div className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="codigo-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">Código de Facultad</label>
                  <input
                    id="codigo-facultad"
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    placeholder="Ej. FIM"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem] uppercase"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre-facultad" className="text-[0.82rem] font-bold text-text-muted uppercase">Nombre de Facultad</label>
                  <input
                    id="nombre-facultad"
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Facultad de Ingeniería Mecánica"
                    className="p-2.5 border border-border rounded-md focus:outline-none focus:border-primary text-[0.88rem]"
                  />
                </div>
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
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[400px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚠️
            </div>
            <h3 className="font-heading font-extrabold text-[1.1rem] text-text-heading mb-2">
              ¿Confirmar eliminación?
            </h3>
            <p className="text-[0.88rem] text-text-muted mb-6">
              Esta acción es irreversible y podría fallar si el elemento tiene otros registros asociados.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  manejarEliminar(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-5 font-bold text-[0.88rem] rounded-md transition-colors shadow-sm cursor-pointer"
              >
                Confirmar y Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
