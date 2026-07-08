import React, { useState, useEffect } from 'react';

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hourSlots = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00'
];

const colorClasses = {
  blue: 'bg-blue-50 border-l-4 border-blue-600 text-blue-800',
  purple: 'bg-purple-50 border-l-4 border-purple-600 text-purple-800',
  green: 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-800',
  orange: 'bg-amber-50 border-l-4 border-amber-600 text-amber-800',
  teal: 'bg-teal-50 border-l-4 border-teal-600 text-teal-800',
  pink: 'bg-pink-50 border-l-4 border-pink-600 text-pink-800'
};

// Parser to convert backend schedule strings like "Lun/Mie 08:00-10:00" into separate slots
const parseBackendSchedule = (backendSections) => {
  const result = [];
  const dayMap = {
    'Lun': 'Lunes',
    'Mar': 'Martes',
    'Mie': 'Miércoles',
    'Jue': 'Jueves',
    'Vie': 'Viernes',
    'Sab': 'Sábado'
  };

  const colors = ['blue', 'purple', 'green', 'orange', 'teal', 'pink'];
  let colorIdx = 0;

  backendSections.forEach(sec => {
    const horarioStr = sec.horario;
    if (!horarioStr) return;

    // Split day indicator and time range
    const parts = horarioStr.split(' ');
    if (parts.length < 2) return;

    const daysPart = parts[0];
    const timePart = parts[1];

    const timeRange = timePart.split('-');
    if (timeRange.length < 2) return;

    const startHour = timeRange[0];
    const endHour = timeRange[1];

    // Split days by slash
    const individualDays = daysPart.split('/');

    const color = colors[colorIdx % colors.length];
    colorIdx++;

    individualDays.forEach(d => {
      const fullDayName = dayMap[d.trim()];
      if (fullDayName) {
        result.push({
          day: fullDayName,
          startHour: startHour,
          endHour: endHour,
          course: sec.curso_nombre || sec.curso || 'Asignatura',
          room: sec.aula || 'Aula N/A',
          color: color
        });
      }
    });
  });

  return result;
};

export default function ScheduleView({ isTeacher = false }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      setErrorMsg(null);

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const url = isTeacher
        ? `${apiBaseUrl}/api/courses/mis-secciones`
        : `${apiBaseUrl}/api/enrollment/mias`;

      try {
        const response = await fetch(url, {
          method: "GET",
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información de horarios desde el servidor.");
        }

        const data = await response.json();

        let sections = [];
        if (isTeacher) {
          sections = data.secciones || [];
        } else {
          const matriculas = data.matriculas || [];
          sections = matriculas.flatMap(m => m.detalles || []);
        }

        const parsed = parseBackendSchedule(sections);
        setScheduleData(parsed);
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al conectar con el servidor para cargar el horario.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [isTeacher]);

  // Helper to find a course for a specific slot
  const getCourseForSlot = (day, hourSlot) => {
    const slotStart = hourSlot.split(' - ')[0];

    return scheduleData.find(item => {
      if (item.day !== day) return false;

      const startVal = parseInt(item.startHour.replace(':', ''));
      const endVal = parseInt(item.endHour.replace(':', ''));
      const currentVal = parseInt(slotStart.replace(':', ''));

      return currentVal >= startVal && currentVal < endVal;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-md p-8 text-center animate-slide-up">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-medium">Cargando horario académico...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-md p-8 text-center text-red-600 animate-slide-up">
        <span className="text-3xl mb-2 block">⚠</span>
        <p className="font-semibold mb-2">{errorMsg}</p>
        <p className="text-[0.85rem] text-text-muted">Asegúrate de que el backend esté ejecutándose.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-md p-6 md:p-8 mb-6 animate-slide-up">
      <div className="mb-7">
        <h3 className="font-heading text-[1.35rem] font-extrabold text-text-heading mb-1.5">📅 Horario Académico — Periodo 2026-I</h3>
        <p className="text-[0.95rem] text-text-muted">
          {isTeacher
            ? 'Vista de dictado de clases asignadas y laboratorios programados.'
            : 'Consulta tus asignaturas matriculadas, secciones y distribución de aulas.'}
        </p>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl shadow-sm bg-white">
        <table className="w-full border-collapse min-w-[900px]">
          <thead>
            <tr>
              <th className="w-[130px] bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">Hora</th>
              {days.map(d => (
                <th key={d} className="bg-bg-alt text-text-heading font-heading font-bold p-4 px-3 border-b border-r border-border last:border-r-0">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hourSlots.map((slot, index) => {
              const startHourStr = slot.split(' - ')[0];
              const isRecess = startHourStr === '13:00';

              return (
                <tr key={index} className={isRecess ? 'bg-amber-50' : ''}>
                  <td className="w-[130px] bg-bg-alt font-bold text-text-heading font-heading text-[0.85rem] p-3 border-b border-r border-border last:border-r-0 text-center align-middle">{slot}</td>
                  {days.map(day => {
                    if (isRecess) {
                      return (
                        <td key={day} className="bg-amber-50 text-amber-600 font-bold font-heading text-[0.85rem] tracking-wider p-3 border-b border-r border-border last:border-r-0 text-center align-middle">
                          {day === 'Lunes' ? '🍔 RECESO / ALMUERZO' : ''}
                        </td>
                      );
                    }

                    const activeCourse = getCourseForSlot(day, slot);

                    if (activeCourse) {
                      const isStart = activeCourse.startHour === startHourStr;
                      const duration = parseInt(activeCourse.endHour.split(':')[0]) - parseInt(activeCourse.startHour.split(':')[0]);

                      if (isStart) {
                        return (
                          <td
                            key={day}
                            rowSpan={duration}
                            className="p-1.5 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle"
                          >
                            <div className={`p-3 px-2.5 rounded-md flex flex-col gap-1 h-full shadow-[0_2px_6px_rgba(0,0,0,0.02)] text-left animate-fade-in ${colorClasses[activeCourse.color] || ''}`}>
                              <span className="font-bold text-text-heading text-[0.88rem] leading-tight">{activeCourse.course}</span>
                              <span className="text-[0.75rem] font-semibold opacity-85">📍 {activeCourse.room}</span>
                              <span className="text-[0.65rem] font-bold uppercase tracking-wider mt-1 self-start py-0.5 px-1.5 rounded bg-white/40">
                                {isTeacher ? '🎓 Docente Principal' : '📚 Teoría y Práctica'}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      return null;
                    }

                    return <td key={day} className="text-slate-300 font-normal p-3 border-b border-r border-border last:border-r-0 text-center text-[0.88rem] align-middle">—</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Schedule Legend */}
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
