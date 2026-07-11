import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { obtenerRoles } from '../../services/servicioUsuarios';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  const cargarRoles = async () => {
    setEstaCargando(true);
    try {
      const datos = await obtenerRoles();
      setRoles(datos.roles || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1"><Shield size={20} /> Roles del Sistema</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de privilegios y clasificaciones de acceso a la plataforma.</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay roles registrados en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse text-left text-xs text-text-main">
                <thead>
                  <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                    <th className="p-2 border-r border-border/60 text-center w-16">ID</th>
                    <th className="p-2 border-r border-border/60 text-left">Nombre del Rol</th>
                    <th className="p-2 text-left">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((rol, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <tr key={rol.id_rol} className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                        <td className="p-2 border-r border-border/60 text-center font-mono text-text-muted">{rol.id_rol}</td>
                        <td className="p-2 border-r border-border/60 font-bold text-primary">{rol.nombre}</td>
                        <td className="p-2 font-semibold text-text-heading">{rol.descripcion || 'Sin descripción'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
