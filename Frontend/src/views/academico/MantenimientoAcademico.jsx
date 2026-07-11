import React, { useState } from 'react';
import { Building2, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import Facultades from './Facultades';
import Especialidades from './Especialidades';
import Cursos from './Cursos';
import Periodos from './Periodos';

export default function MantenimientoAcademico() {
  const [activoTab, setActivoTab] = useState('facultades');

  return (
    <div className="flex flex-col gap-6">
      {/* Fila de navegación por pestañas */}
      <div className="flex overflow-x-auto max-w-full whitespace-nowrap bg-bg-alt/50 p-1.5 rounded-lg gap-1 border border-border scrollbar-none">
        <button
          type="button"
          onClick={() => setActivoTab('facultades')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'facultades' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Building2 size={16} /> Facultades
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('especialidades')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'especialidades' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <GraduationCap size={16} /> Especialidades / Carreras
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('cursos')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'cursos' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <BookOpen size={16} /> Cursos
        </button>
        <button
          type="button"
          onClick={() => setActivoTab('periodos')}
          className={`flex items-center gap-1.5 py-2 px-5.5 text-[0.88rem] font-bold rounded-md transition-all duration-200 cursor-pointer shrink-0 ${activoTab === 'periodos' ? 'bg-white text-primary shadow-sm border border-border' : 'text-text-muted hover:text-primary hover:bg-white/50'}`}
        >
          <Calendar size={16} /> Periodos Académicos
        </button>
      </div>

      {/* Contenido activo de la pestaña */}
      <div className="mt-2">
        {activoTab === 'facultades' && <Facultades />}
        {activoTab === 'especialidades' && <Especialidades />}
        {activoTab === 'cursos' && <Cursos />}
        {activoTab === 'periodos' && <Periodos />}
      </div>
    </div>
  );
}
