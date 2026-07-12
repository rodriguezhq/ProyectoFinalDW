import React from 'react';
import { Search } from 'lucide-react';
import Dialog from '../../../components/UI/Dialog';

export default function ModalDetalleAuditoria({
  isOpen,
  onClose,
  audit,
  obtenerColorInsignia
}) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      size="md" 
      className="rounded-none"
    >
      <Dialog.Header showCloseButton={true} className="bg-slate-50 border-b border-border">
        <div className="flex items-center gap-2 font-heading font-black text-text-heading uppercase text-xs tracking-wider">
          <Search size={16} /> Detalle de Operación Auditada
        </div>
      </Dialog.Header>

      <Dialog.Content className="p-6 flex flex-col gap-5 text-xs text-text-main font-medium">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Acción Realizada</span>
          <div>
            <span className={`py-1 px-3 rounded-none border inline-block text-[10px] font-black uppercase tracking-wider ${obtenerColorInsignia(audit?.accion)}`}>
              {audit?.accion}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tabla Afectada</span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded-none self-start border border-border/40">
              {audit?.tabla}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ID de Registro</span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 py-1 px-2.5 rounded-none self-start font-mono border border-border/40">
              {audit?.registro || 'N/A'}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Usuario / Autor</span>
            <span className="text-xs font-bold text-text-heading">
              {audit?.usuario_nombre || 'Invitado (Sin Login)'}
            </span>
            {audit?.id_usuario && (
              <span className="text-[10px] text-text-muted font-mono">ID Usuario: {audit.id_usuario}</span>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">IP de Origen</span>
            <span className="text-xs font-bold text-slate-600 font-mono">
              {audit?.ip || 'Local/Desconocido'}
            </span>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Fecha y Hora de la Operación</span>
          <span className="text-xs font-bold text-text-heading">
            {audit?.fecha ? new Date(audit.fecha).toLocaleString('es-PE') : '-'}
          </span>
          <span className="text-[10px] text-text-muted font-mono">
            {audit?.fecha}
          </span>
        </div>
      </Dialog.Content>

      <Dialog.Footer className="bg-slate-50">
        <button
          type="button"
          onClick={onClose}
          className="bg-primary text-white py-2 px-6 font-bold text-xs uppercase tracking-wider rounded-none hover:bg-primary-dark transition-colors shadow-sm cursor-pointer border-none"
        >
          Cerrar Detalle
        </button>
      </Dialog.Footer>
    </Dialog>
  );
}
