import React from 'react';

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

// Predefined realistic courses for visualization
const mockScheduleData = [
  { day: 'Lunes', startHour: '08:00', endHour: '10:00', course: 'Desarrollo de Aplicaciones Web', room: 'Aula 301-B', color: 'blue' },
  { day: 'Lunes', startHour: '10:00', endHour: '12:00', course: 'Ingeniería de Software', room: 'Laboratorio L-2', color: 'purple' },
  { day: 'Martes', startHour: '09:00', endHour: '11:00', course: 'Base de Datos II', room: 'Aula 204-A', color: 'green' },
  { day: 'Martes', startHour: '14:00', endHour: '16:00', course: 'Estructura de Datos', room: 'Laboratorio L-1', color: 'orange' },
  { day: 'Miércoles', startHour: '08:00', endHour: '10:00', course: 'Desarrollo de Aplicaciones Web', room: 'Aula 301-B', color: 'blue' },
  { day: 'Miércoles', startHour: '11:00', endHour: '13:00', course: 'Ingeniería de Software', room: 'Laboratorio L-2', color: 'purple' },
  { day: 'Jueves', startHour: '10:00', endHour: '12:00', course: 'Base de Datos II', room: 'Aula 204-A', color: 'green' },
  { day: 'Jueves', startHour: '15:00', endHour: '17:00', course: 'Estructura de Datos', room: 'Laboratorio L-1', color: 'orange' },
  { day: 'Viernes', startHour: '08:00', endHour: '10:00', course: 'Seminario de Tesis', room: 'Aula 102', color: 'teal' },
  { day: 'Viernes', startHour: '14:00', endHour: '18:00', course: 'Taller de Programación Web', room: 'Laboratorio L-3', color: 'blue' },
  { day: 'Sábado', startHour: '09:00', endHour: '12:00', course: 'Actividad Extracurricular', room: 'Campo Deportivo', color: 'pink' }
];

export default function ScheduleView({ isTeacher = false }) {
  // Helper to find a course for a specific slot
  const getCourseForSlot = (day, hourSlot) => {
    const slotStart = hourSlot.split(' - ')[0];
    
    return mockScheduleData.find(item => {
      if (item.day !== day) return false;
      
      const startVal = parseInt(item.startHour.replace(':', ''));
      const endVal = parseInt(item.endHour.replace(':', ''));
      const currentVal = parseInt(slotStart.replace(':', ''));
      
      return currentVal >= startVal && currentVal < endVal;
    });
  };

  return (
    <div className="schedule-card animate-slide-up">
      <div className="schedule-header-info">
        <h3 className="schedule-title">📅 Horario Académico — Periodo 2026-I</h3>
        <p className="schedule-subtitle">
          {isTeacher 
            ? 'Vista de dictado de clases asignadas y laboratorios programados.'
            : 'Consulta tus asignaturas matriculadas, secciones y distribución de aulas.'}
        </p>
      </div>

      <div className="schedule-table-wrapper">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="hour-col-header">Hora</th>
              {days.map(d => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hourSlots.map((slot, index) => {
              const startHourStr = slot.split(' - ')[0];
              const isRecess = startHourStr === '13:00';

              return (
                <tr key={index} className={isRecess ? 'recess-row' : ''}>
                  <td className="hour-cell">{slot}</td>
                  {days.map(day => {
                    if (isRecess) {
                      return (
                        <td key={day} className="recess-cell">
                          {day === 'Lunes' ? '🍔 RECESO / ALMUERZO' : ''}
                        </td>
                      );
                    }

                    const activeCourse = getCourseForSlot(day, slot);

                    if (activeCourse) {
                      // Only render contents on the start slot to handle merge effect mock
                      const isStart = activeCourse.startHour === startHourStr;
                      
                      // Calculate row span
                      const duration = parseInt(activeCourse.endHour.split(':')[0]) - parseInt(activeCourse.startHour.split(':')[0]);

                      if (isStart) {
                        return (
                          <td 
                            key={day} 
                            rowSpan={duration} 
                            className={`course-cell course-${activeCourse.color}`}
                          >
                            <div className="course-block">
                              <span className="course-name-label">{activeCourse.course}</span>
                              <span className="course-room-label">📍 {activeCourse.room}</span>
                              <span className="course-type-tag">
                                {isTeacher ? '🎓 Docente Principal' : '📚 Teoría y Práctica'}
                              </span>
                            </div>
                          </td>
                        );
                      }
                      
                      // Return null for spanned slots so layout matches
                      return null;
                    }

                    return <td key={day} className="empty-cell">—</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Schedule Legend */}
      <div className="schedule-legend">
        <span className="legend-label">Código de colores:</span>
        <div className="legend-items">
          <span className="legend-item blue">Desarrollo Web</span>
          <span className="legend-item purple">Ing. Software</span>
          <span className="legend-item green">Base de Datos</span>
          <span className="legend-item orange">Estructuras</span>
          <span className="legend-item teal">Tesis / Otros</span>
        </div>
      </div>
    </div>
  );
}
