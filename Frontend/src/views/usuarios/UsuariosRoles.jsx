import React, { useState } from 'react';
import { GraduationCap, Presentation, Shield, Briefcase } from 'lucide-react';
import Usuarios from './Usuarios';

export default function UsuariosRoles() {
  const [activoTab, setActivoTab] = useState('Estudiante');

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Pestañas de navegación por rol */}
      <div className="flex overflow-x-auto max-w-full whitespace-nowrap bg-bg-alt/50 p-1.5 rounded-lg gap-1 border border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setActivoTab('Estudiante')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'Estudiante' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <GraduationCap size={16} /> Estudiantes
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('Docente')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'Docente' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Presentation size={16} /> Docentes
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('Administrador')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'Administrador' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Shield size={16} /> Administradores
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('Direccion')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'Direccion' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Briefcase size={16} /> Dirección
        </button>
      </div>

      {/* Contenido de la pestaña de usuarios */}
      <div className="mt-2">
        <Usuarios rolFiltrado={activoTab} />
      </div>
    </div>
  );
}
