import React from 'react';
import { useHorario } from '../../hooks/horarios/useHorario';
import { diasSemana, franjasHorarias, clasesColor } from '../../constants/horarios';

export default function VistaHorario({ isTeacher = false }) {
  const esDocente = isTeacher;
  
  // Utilizar hook personalizado para obtener los datos del horario
  const { datosHorario, estaCargando, mensajeError } = useHorario(esDocente);

  const obtenerCursoParaSlot = (dia, slotHora) => {
    const horaInicioSlot = slotHora.split(' - ')[0];
    
    return datosHorario.find(item => {
      if (item.dia !== dia) return false;
      
      const valorInicio = parseInt(item.horaInicio.replace(':', ''));
      const valorFin = parseInt(item.horaFin.replace(':', ''));
      const valorActual = parseInt(horaInicioSlot.replace(':', ''));
      
      return valorActual >= valorInicio && valorActual < valorFin;
    });
  };

  if (estaCargando) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-md p-8 text-center animate-slide-up">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-medium">Cargando horario académico...</p>
      </div>
    );
  }

  if (mensajeError) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-md p-8 text-center text-red-600 animate-slide-up">
        <span className="text-3xl mb-2 block">⚠</span>
        <p className="font-semibold mb-2">{mensajeError}</p>
        <p className="text-[0.85rem] text-text-muted">Asegúrate de que el backend esté ejecutándose.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-md p-4 md:p-6 mb-4 animate-slide-up">
      <div className="mb-7">
        <h3 className="font-heading text-[1.35rem] font-extrabold text-text-heading mb-1.5">📅 Horario Académico — Periodo 2026-I</h3>
        <p className="text-[0.95rem] text-text-muted">
          {esDocente 
            ? 'Vista de dictado de clases asignadas y laboratorios programados.'
            : 'Consulta tus asignaturas matriculadas, secciones y distribución de aulas.'}
        </p>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl shadow-sm bg-white">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="w-[130px] bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">Hora</th>
              {diasSemana.map(d => (
                <th key={d} className="bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {franjasHorarias.map((slot, index) => {
              const horaInicioStr = slot.split(' - ')[0];
              const esReceso = horaInicioStr === '13:00';

              return (
                <tr key={index} className={esReceso ? 'bg-amber-50' : ''}>
                  <td className="w-[130px] bg-bg-alt font-bold text-text-heading font-heading text-[0.85rem] p-3 border-b border-r border-border last:border-r-0 text-center align-middle">{slot}</td>
                  {diasSemana.map(dia => {
                    if (esReceso) {
                      return (
                        <td key={dia} className="bg-amber-50 text-amber-600 font-bold font-heading text-[0.85rem] tracking-wider p-3 border-b border-r border-border last:border-r-0 text-center align-middle">
                          {dia === 'Lunes' ? '🍔 RECESO / ALMUERZO' : ''}
                        </td>
                      );
                    }

                    const cursoActivo = obtenerCursoParaSlot(dia, slot);

                    if (cursoActivo) {
                      const esInicio = cursoActivo.horaInicio === horaInicioStr;
                      const duracion = parseInt(cursoActivo.horaFin.split(':')[0]) - parseInt(cursoActivo.horaInicio.split(':')[0]);

                      if (esInicio) {
                        return (
                          <td 
                            key={dia} 
                            rowSpan={duracion} 
                            className="p-1.5 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle"
                          >
                            <div className={`p-3 px-2.5 rounded-md flex flex-col gap-1 h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left animate-fade-in ${clasesColor[cursoActivo.color] || ''}`}>
                              <span className="font-bold text-text-heading text-[0.88rem] leading-tight">{cursoActivo.curso}</span>
                              <span className="text-[0.65rem] font-bold uppercase tracking-wider mt-1 self-start py-0.5 px-1.5 rounded bg-white/40">
                                {esDocente ? '🎓 Docente Principal' : '📚 Teoría y Práctica'}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      return null;
                    }

                    return <td key={dia} className="text-slate-300 font-normal p-3 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle">—</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center flex-wrap gap-4 text-[0.85rem]">
        <span className="font-bold text-text-heading">Código de colores:</span>
        <div className="flex flex-wrap gap-2">
          <span className="text-[0.75rem] font-semibold py-1 px-2.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200/50">Desarrollo Web</span>
          <span className="text-[0.75rem] font-semibold py-1 px-2.5 rounded-full border bg-purple-50 text-purple-600 border-purple-200/50">Ing. Software</span>
          <span className="text-[0.75rem] font-semibold py-1 px-2.5 rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200/50">Base de Datos</span>
          <span className="text-[0.75rem] font-semibold py-1 px-2.5 rounded-full border bg-amber-50 text-amber-600 border-amber-200/50">Estructuras</span>
          <span className="text-[0.75rem] font-semibold py-1 px-2.5 rounded-full border bg-teal-50 text-teal-600 border-teal-200/50">Tesis / Otros</span>
        </div>
      </div>
    </div>
  );
}
