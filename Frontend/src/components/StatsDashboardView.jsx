import React from 'react';

export default function StatsDashboardView({ isDirection = false }) {
  return (
    <div className="stats-dashboard-wrapper animate-slide-up">
      {/* Metric Cards Grid */}
      <div className="dashboard-metrics-grid">
        {isDirection ? (
          <>
            <div className="metric-box box-primary">
              <div className="metric-header">
                <span className="metric-title">Promedio Ponderado Acumulado</span>
                <span className="metric-trend green">↑ 4.2%</span>
              </div>
              <div className="metric-number">14.62</div>
              <p className="metric-desc">Promedio general ponderado de estudiantes de pregrado.</p>
            </div>
            
            <div className="metric-box box-accent">
              <div className="metric-header">
                <span className="metric-title">Tasa de Aprobación General</span>
                <span className="metric-trend green">↑ 1.8%</span>
              </div>
              <div className="metric-number">79.4%</div>
              <p className="metric-desc">Alumnos que pasaron satisfactoriamente sus asignaturas.</p>
            </div>

            <div className="metric-box box-info">
              <div className="metric-header">
                <span className="metric-title">Carga Horaria Docente</span>
                <span className="metric-trend neutral">=</span>
              </div>
              <div className="metric-number">18.5 hrs</div>
              <p className="metric-desc">Promedio de horas lectivas semanales por docente asignado.</p>
            </div>

            <div className="metric-box box-success">
              <div className="metric-header">
                <span className="metric-title">Certificados Emitidos</span>
                <span className="metric-trend green">↑ 12%</span>
              </div>
              <div className="metric-number">348</div>
              <p className="metric-desc">Documentos académicos validados e impresos con código QR.</p>
            </div>
          </>
        ) : (
          <>
            <div className="metric-box box-primary">
              <div className="metric-header">
                <span className="metric-title">Total Alumnos Matriculados</span>
                <span className="metric-trend green">↑ 8.5%</span>
              </div>
              <div className="metric-number">1,248</div>
              <p className="metric-desc">Estudiantes con matrícula aprobada en el periodo 2026-I.</p>
            </div>
            
            <div className="metric-box box-accent">
              <div className="metric-header">
                <span className="metric-title">Validaciones Pendientes</span>
                <span className="metric-trend red">↓ 15%</span>
              </div>
              <div className="metric-number">23</div>
              <p className="metric-desc">Fichas de matrícula en espera de confirmación de requisitos.</p>
            </div>

            <div className="metric-box box-info">
              <div className="metric-header">
                <span className="metric-title">Tasas de Pago Registradas</span>
                <span className="metric-trend green">↑ 92%</span>
              </div>
              <div className="metric-number">S/. 184.2K</div>
              <p className="metric-desc">Monto recaudado de pagos verificados por caja institucional.</p>
            </div>

            <div className="metric-box box-success">
              <div className="metric-header">
                <span className="metric-title">Secciones Aperturadas</span>
                <span className="metric-trend green">↑ 4</span>
              </div>
              <div className="metric-number">74</div>
              <p className="metric-desc">Aulas programadas para el ciclo en curso en diversas facultades.</p>
            </div>
          </>
        )}
      </div>

      {/* Main Charts / Status row */}
      <div className="dashboard-charts-row">
        {/* Left Side: Custom CSS Chart */}
        <div className="chart-box">
          <h3 className="chart-title">📈 {isDirection ? 'Rendimiento Académico por Especialidad' : 'Estado de Trámites y Matrículas'}</h3>
          <p className="chart-subtitle">Resumen visual de los indicadores críticos del periodo lectivo.</p>
          
          <div className="custom-bar-chart">
            <div className="chart-bar-group">
              <span className="bar-label">Ing. Sistemas</span>
              <div className="bar-container">
                <div className="bar-fill fill-primary" style={{ width: '85%' }}></div>
              </div>
              <span className="bar-value">{isDirection ? '15.4' : '85%'}</span>
            </div>
            <div className="chart-bar-group">
              <span className="bar-label">Ing. Civil</span>
              <div className="bar-container">
                <div className="bar-fill fill-accent" style={{ width: '70%' }}></div>
              </div>
              <span className="bar-value">{isDirection ? '14.1' : '70%'}</span>
            </div>
            <div className="chart-bar-group">
              <span className="bar-label">Ing. Química</span>
              <div className="bar-container">
                <div className="bar-fill fill-info" style={{ width: '78%' }}></div>
              </div>
              <span className="bar-value">{isDirection ? '14.8' : '78%'}</span>
            </div>
            <div className="chart-bar-group">
              <span className="bar-label">Ing. Eléctrica</span>
              <div className="bar-container">
                <div className="bar-fill fill-success" style={{ width: '62%' }}></div>
              </div>
              <span className="bar-value">{isDirection ? '13.2' : '62%'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Activity List */}
        <div className="activity-box">
          <h3 className="chart-title">⏱️ {isDirection ? 'Control de Auditoría y Bitácora' : 'Solicitudes Recientes'}</h3>
          <p className="chart-subtitle">Registro inmediato de operaciones críticas en el sistema.</p>

          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-dot dot-green"></span>
              <div className="activity-details">
                <span className="activity-text">
                  {isDirection 
                    ? 'Firma autorizada para el Certificado de Notas de la alumna María Huamán.' 
                    : 'Pago registrado por concepto de matrícula — Estudiante Scoot F.'}
                </span>
                <span className="activity-time">Hace 5 minutos</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-dot dot-blue"></span>
              <div className="activity-details">
                <span className="activity-text">
                  {isDirection 
                    ? 'Carga de sílabos aprobada para la asignatura Estructuras de Datos.' 
                    : 'Nueva solicitud de matrícula registrada — Alumno Cristhian R.'}
                </span>
                <span className="activity-time">Hace 20 minutos</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-dot dot-orange"></span>
              <div className="activity-details">
                <span className="activity-text">
                  {isDirection 
                    ? 'Auditoría: Acceso administrativo detectado desde IP 192.168.1.10.' 
                    : 'Ficha de matrícula generada y firmada en PDF.'}
                </span>
                <span className="activity-time">Hace 1 hora</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-dot dot-red"></span>
              <div className="activity-details">
                <span className="activity-text">
                  {isDirection 
                    ? 'Intento fallido de modificación de notas detectado en Secciona A.' 
                    : 'Validación de requisitos rechazada (documento pendiente).'}
                </span>
                <span className="activity-time">Hace 3 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
