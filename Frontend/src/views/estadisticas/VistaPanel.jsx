import React from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, History } from 'lucide-react';

export default function VistaPanel({ isDirection = false }) {
  const esDireccion = isDirection;

  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      {/* Cuadrícula de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-primary">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">
              {esDireccion ? 'Promedio Ponderado Acumulado' : 'Total Alumnos Matriculados'}
            </span>
            <span className="flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">
              <TrendingUp size={12} /> {esDireccion ? '4.2%' : '8.5%'}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">
            {esDireccion ? '14.62' : '1,248'}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">
            {esDireccion 
              ? 'Promedio general ponderado de estudiantes de pregrado.' 
              : 'Estudiantes con matrícula aprobada en el periodo 2026-I.'}
          </p>
        </div>
        
        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-accent">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">
              {esDireccion ? 'Tasa de Aprobación General' : 'Validaciones Pendientes'}
            </span>
            <span className="flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">
              {esDireccion ? <><TrendingUp size={12} /> 1.8%</> : <><TrendingDown size={12} /> 15%</>}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">
            {esDireccion ? '79.4%' : '23'}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">
            {esDireccion 
              ? 'Alumnos que pasaron satisfactoriamente sus asignaturas.' 
              : 'Fichas de matrícula en espera de confirmación de requisitos.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-blue-500">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">
              {esDireccion ? 'Carga Horaria Docente' : 'Tasas de Pago Registradas'}
            </span>
            <span className="flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-slate-100 text-slate-500">
              {esDireccion ? <Minus size={12} /> : <><TrendingUp size={12} /> 92%</>}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">
            {esDireccion ? '18.5 hrs' : 'S/. 184.2K'}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">
            {esDireccion 
              ? 'Promedio de horas lectivas semanales por docente asignado.' 
              : 'Monto recaudado de pagos verificados por caja institucional.'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-6 shadow-sm flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight">
              {esDireccion ? 'Certificados Emitidos' : 'Secciones Aperturadas'}
            </span>
            <span className="flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 rounded bg-emerald-100 text-emerald-600">
              <TrendingUp size={12} /> {esDireccion ? '12%' : '4'}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none">
            {esDireccion ? '348' : '74'}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed">
            {esDireccion 
              ? 'Documentos académicos validados e impresos con código QR.' 
              : 'Aulas programadas para el ciclo en curso en diversas facultades.'}
          </p>
        </div>
      </div>

      {/* Gráficos y Bitácora */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        {/* Gráfico Customizado en CSS */}
        <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-md">
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
            <BarChart3 size={20} /> {esDireccion ? 'Rendimiento Académico por Especialidad' : 'Estado de Trámites y Matrículas'}
          </h3>
          <p className="text-[0.88rem] text-text-muted mb-7">Resumen visual de los indicadores críticos del periodo lectivo.</p>
          
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Sistemas</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-primary" style={{ width: '85%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">
                {esDireccion ? '15.4' : '85%'}
              </span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Civil</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-accent" style={{ width: '70%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">
                {esDireccion ? '14.1' : '70%'}
              </span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Química</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-blue-500" style={{ width: '78%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">
                {esDireccion ? '14.8' : '78%'}
              </span>
            </div>
            <div className="grid grid-cols-[120px_1fr_50px] gap-4 items-center">
              <span className="text-[0.88rem] font-semibold text-text-heading">Ing. Eléctrica</span>
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000 animate-slide-right bg-emerald-500" style={{ width: '62%' }}></div>
              </div>
              <span className="text-[0.88rem] font-bold text-text-heading text-right">
                {esDireccion ? '13.2' : '62%'}
              </span>
            </div>
          </div>
        </div>

        {/* Solicitudes / Bitácora Recientes */}
        <div className="bg-white rounded-xl border border-border p-6 md:p-8 shadow-md">
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
            <History size={20} /> {esDireccion ? 'Control de Auditoría y Bitácora' : 'Solicitudes Recientes'}
          </h3>
          <p className="text-[0.88rem] text-text-muted mb-7">Registro inmediato de operaciones críticas en el sistema.</p>

          <div className="flex flex-col gap-6 relative after:content-[''] after:absolute after:top-1.5 after:bottom-1.5 after:left-[5px] after:w-[2px] after:bg-slate-200">
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-emerald-500 shadow-[0_0_0_2px_#A7F3D0]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  {esDireccion 
                    ? 'Firma autorizada para el Certificado de Notas de la alumna María Huamán.' 
                    : 'Pago registrado por concepto de matrícula — Estudiante Scoot F.'}
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 5 minutos</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-blue-500 shadow-[0_0_0_2px_#BFDBFE]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  {esDireccion 
                    ? 'Carga de sílabos aprobada para la asignatura Estructuras de Datos.' 
                    : 'Nueva solicitud de matrícula registrada — Alumno Cristhian R.'}
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 20 minutos</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-amber-500 shadow-[0_0_0_2px_#FDE68A]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  {esDireccion 
                    ? 'Auditoría: Acceso administrativo detectado desde IP 192.168.1.10.' 
                    : 'Ficha de matrícula generada y firmada en PDF.'}
                </span>
                <span className="text-[0.75rem] text-text-muted">Hace 1 hora</span>
              </div>
            </div>
            <div className="flex gap-4 items-start relative">
              <span className="w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 bg-red-500 shadow-[0_0_0_2px_#FCA5A5]"></span>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                  {esDireccion 
                    ? 'Intento fallido de modificación de notas detectado en Seccion A.' 
                    : 'Validación de requisitos rechazada (documento pendiente).'}
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
