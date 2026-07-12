import React, { useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useAuditoria } from '../../hooks/direccion/useAuditoria';
import FiltrosAuditoria from './components/FiltrosAuditoria';
import TablaAuditoria from './components/TablaAuditoria';
import ModalDetalleAuditoria from './components/ModalDetalleAuditoria';

export default function Auditoria() {
  const {
    auditorias,
    estaCargando,
    pagina,
    totalPaginas,
    total,
    accionesDisponibles,
    usuariosDisponibles,
    filtroAccion,
    filtroUsuario,
    cambiarFiltroAccion,
    cambiarFiltroUsuario,
    limpiarFiltros,
    irAPagina
  } = useAuditoria();

  // Modal para ver detalles
  const [auditSeleccionado, setAuditSeleccionado] = useState(null);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);

  const abrirModalDetalle = (audit) => {
    setAuditSeleccionado(audit);
    setModalDetalleOpen(true);
  };

  const obtenerColorInsignia = (accion) => {
    const act = (accion || '').toLowerCase();
    if (act.includes('crear') || act.includes('registrar_pago') || act.includes('validar_acta')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (act.includes('actualizar') || act.includes('modificar') || act.includes('seccion') || act.includes('horario')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (act.includes('eliminar') || act.includes('rechazar')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (act.includes('login_exitoso') || act.includes('aprobar')) {
      return 'bg-sky-50 text-sky-700 border-sky-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center border-b border-border pb-3 gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
              <ScrollText size={20} /> Bitácora de Auditoría
            </h3>
            <p className="text-[0.88rem] text-text-muted">Registro completo de operaciones, inicios de sesión y modificaciones del sistema.</p>
          </div>
          {(filtroAccion || filtroUsuario) && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="border border-border hover:bg-slate-50 text-text-muted py-2 px-4 text-xs font-bold rounded-none uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        {/* Filtros de auditoría */}
        <FiltrosAuditoria
          filtroAccion={filtroAccion}
          filtroUsuario={filtroUsuario}
          cambiarFiltroAccion={cambiarFiltroAccion}
          cambiarFiltroUsuario={cambiarFiltroUsuario}
          accionesDisponibles={accionesDisponibles}
          usuariosDisponibles={usuariosDisponibles}
        />

        {/* Tabla de registros de auditoría */}
        <TablaAuditoria
          auditorias={auditorias}
          estaCargando={estaCargando}
          abrirModalDetalle={abrirModalDetalle}
          obtenerColorInsignia={obtenerColorInsignia}
          total={total}
          pagina={pagina}
          totalPaginas={totalPaginas}
          irAPagina={irAPagina}
        />
      </div>

      {/* Modal detallado */}
      <ModalDetalleAuditoria
        isOpen={modalDetalleOpen}
        onClose={() => setModalDetalleOpen(false)}
        audit={auditSeleccionado}
        obtenerColorInsignia={obtenerColorInsignia}
      />
    </>
  );
}
