import React from 'react';

export default function VistaPanel() {
  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-primary">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">Promedio Ponderado Acumulado</span>
            <span className="text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">↑ 4.2%</span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">14.62</div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">Promedio general ponderado de estudiantes de pregrado.</p>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-accent">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">Tasa de Aprobación General</span>
            <span className="text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">↑ 1.8%</span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">79.4%</div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">Alumnos que pasaron satisfactoriamente sus asignaturas.</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">Carga Horaria Docente</span>
            <span className="text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-slate-100 text-slate-500">=</span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">18.5 hrs</div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">Promedio de horas lectivas semanales por docente asignado.</p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">Certificados Emitidos</span>
            <span className="text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">↑ 12%</span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">348</div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">Documentos académicos validados e impresos con código QR.</p>
        </div>
      </div>

      {/* Main Charts / Status row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Left Side: Custom CSS Chart */}
        <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-md">
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">📈 Rendimiento Académico por Especialidad</h3>
          <p className="text-[0.88rem] text-text-muted mb-7">Resumen visual de los indicadores críticos del periodo lectivo.</p>
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Sistemas</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-primary" style={{ width: '85%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">15.4</span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Civil</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-accent" style={{ width: '70%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">14.1</span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Química</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-blue-500" style={{ width: '78%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">14.8</span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Eléctrica</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-emerald-500" style={{ width: '62%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">13.2</span>
            </div>
          </div>
        </div>

        {/* Right Side: Activity List */}
        <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-md">
          <h3 className="font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">⏱️ Control de Auditoría y Bitácora</h3>
          <p className="text-[0.88rem] text-text-muted mb-7">Registro inmediato de operaciones críticas en el sistema.</p>

          <div className="flex flex-col gap-6 relative after:content-[''] after:absolute after:top-1.5 after:bottom-1.5 after:left-[5px] after:w-[2px] after:bg-slate-200">
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-emerald-500 shadow-[0_0_0_2px_#A7F3D0]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  Firma autorizada para el Certificado de Notas de la alumna María Huamán.
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 5 minutos</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-blue-500 shadow-[0_0_0_2px_#BFDBFE]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  Carga de sílabos aprobada para la asignatura Estructuras de Datos.
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 20 minutos</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-amber-500 shadow-[0_0_0_2px_#FDE68A]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  Auditoría: Acceso administrativo detectado desde IP 192.168.1.10.
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 1 hora</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-red-500 shadow-[0_0_0_2px_#FCA5A5]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  Intento fallido de modificación de notas detectado en Seccion A.
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 3 horas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
