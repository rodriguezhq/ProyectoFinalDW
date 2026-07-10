import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../../utils/api';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/admin/roles`, {
        method: 'GET'
      });
      if (!response.ok) throw new Error('Error al cargar los roles de usuario');
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-4">
          <div>
            <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">🛡️ Roles del Sistema</h3>
            <p className="text-[0.88rem] text-text-muted">Gestión de privilegios y clasificaciones de acceso a la plataforma.</p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {isLoading ? (
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
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="bg-bg-alt border-b border-border">
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">ID</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Nombre del Rol</th>
                    <th className="p-4 text-left text-[0.85rem] font-heading font-extrabold text-text-heading">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {roles.map((rol) => (
                    <tr key={rol.id_rol} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-[0.88rem] font-mono text-text-muted">{rol.id_rol}</td>
                      <td className="p-4 text-[0.88rem] font-bold text-primary">{rol.nombre}</td>
                      <td className="p-4 text-[0.88rem] font-semibold text-text-heading">{rol.descripcion || 'Sin descripción'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
