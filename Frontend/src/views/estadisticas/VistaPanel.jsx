import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, History, RefreshCw, Clock } from 'lucide-react';

// Importación de los servicios de la API
import { 
  obtenerPeriodos, 
  obtenerSecciones, 
  obtenerCargaDocente 
} from '../../services/servicioAcademico';
import { 
  obtenerAuditoria, 
  obtenerDesempenoCohortes 
} from '../../services/servicioDireccion';
import { 
  obtenerTodosLosDocumentos 
} from '../../services/servicioCertificados';
import {
  listarMatriculasAdmin
} from '../../services/servicioMatriculaAdmin';
import { fechaUTCaDate } from '../../utils/fecha';

export default function VistaPanel({ isDirection = false }) {
  const esDireccion = isDirection;

  // Estados de la aplicación (todos en español)
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  
  const [metricas, setMetricas] = useState({
    ppaGlobal: 0,
    tasaAprobacion: 0,
    cargaDocente: 0,
    certificadosEmitidos: 0,
    totalMatriculados: 0,
    validacionesPendientes: 0,
    tasasPago: 0,
    seccionesAperturadas: 0,
  });

  const [datosGrafico, setDatosGrafico] = useState([]);
  const [bitacora, setBitacora] = useState([]);

  const claseContenedor = esDireccion ? "rounded-none shadow-xs" : "rounded-xl shadow-sm";
  const claseBoton = esDireccion ? "rounded-none" : "rounded-lg";
  const claseBadge = esDireccion ? "rounded-none" : "rounded";
  const claseBarra = esDireccion ? "rounded-none" : "rounded-full";

  // Función para formatear el tiempo transcurrido o la fecha de manera legible
  function formatearTiempo(fechaTexto) {
    if (!fechaTexto) return '';
    
    const fecha = fechaUTCaDate(fechaTexto);
    const ahora = new Date();

    if (!fecha) return fechaTexto;
    
    const difMs = ahora - fecha;
    const difMinutos = Math.floor(difMs / 60000);
    
    if (difMinutos < 1) return 'Hace unos instantes';
    if (difMinutos < 60) return `Hace ${difMinutos} min`;
    
    const difHoras = Math.floor(difMinutos / 60);
    if (difHoras < 24) return `Hace ${difHoras} hora${difHoras > 1 ? 's' : ''}`;
    
    return fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Carga de datos asíncrona desde el backend
  async function cargarDatosDashboard() {
    try {
      setCargando(true);
      setError(null);

      // 1. Obtener todos los periodos académicos y determinar cuál es el activo
      const respuestaPeriodos = await obtenerPeriodos();
      const listaPeriodos = respuestaPeriodos.periodos || [];
      const activo = listaPeriodos.find(p => p.estado === 'activo') || listaPeriodos[0];
      setPeriodoActivo(activo);

      const idPeriodoActivo = activo ? activo.id_periodo : null;

      if (esDireccion) {
        // --- PANEL DE DIRECCIÓN ESTRATÉGICA ---
        // Las 4 consultas son independientes entre si: se disparan en paralelo
        // en vez de una tras otra, para no sumar la latencia de red de cada una.
        const [
          resultadoDesempeno,
          resultadoCarga,
          resultadoDocs,
          resultadoAuditoria
        ] = await Promise.allSettled([
          obtenerDesempenoCohortes('', 1, 1000),
          idPeriodoActivo ? obtenerCargaDocente(idPeriodoActivo) : Promise.resolve(null),
          obtenerTodosLosDocumentos(1, 1000),
          obtenerAuditoria('', '', 1, 4)
        ]);

        // Desempeño de cohortes (promedio acumulado, tasa aprobación y gráfico)
        let desempeno = [];
        let ppaGlobal = 0;
        let tasaAprobacion = 0;
        if (resultadoDesempeno.status === 'fulfilled') {
          const respuestaDesempeno = resultadoDesempeno.value;
          desempeno = respuestaDesempeno.desempeno || [];
          if (respuestaDesempeno.resumen_global) {
            ppaGlobal = respuestaDesempeno.resumen_global.promedio_ppa_global || 0;
            tasaAprobacion = respuestaDesempeno.resumen_global.tasa_aprobacion_global || 0;
          }
        } else {
          console.error("Error al obtener desempeño para dirección:", resultadoDesempeno.reason);
        }

        // Carga docente (promedio de horas asignadas)
        let promedioCargaDocente = 0;
        if (resultadoCarga.status === 'fulfilled' && resultadoCarga.value) {
          const listaCarga = resultadoCarga.value.carga || [];
          if (listaCarga.length > 0) {
            const sumaHoras = listaCarga.reduce((sum, item) => sum + (item.total_horas || 0), 0);
            promedioCargaDocente = Math.round((sumaHoras / listaCarga.length) * 10) / 10;
          }
        } else if (resultadoCarga.status === 'rejected') {
          console.error("Error al obtener carga docente:", resultadoCarga.reason);
        }

        // Certificados emitidos (filtrado de todos los documentos)
        let totalCertificados = 0;
        if (resultadoDocs.status === 'fulfilled') {
          const documentos = resultadoDocs.value.documentos || [];
          totalCertificados = documentos.filter(d => d.estado === 'emitido').length;
        } else {
          console.error("Error al obtener documentos para dirección:", resultadoDocs.reason);
        }

        // Bitácora de auditoría reciente (las últimas 4 operaciones)
        let auditoriaReciente = [];
        if (resultadoAuditoria.status === 'fulfilled') {
          auditoriaReciente = resultadoAuditoria.value.auditorias || [];
        } else {
          console.error("Error al obtener bitácora de auditoría:", resultadoAuditoria.reason);
        }

        // Procesar rendimiento académico por especialidad para la gráfica
        const agrupadoEspecialidades = {};
        desempeno.forEach(item => {
          const especialidad = item.especialidad_nombre;
          if (especialidad) {
            if (!agrupadoEspecialidades[especialidad]) {
              agrupadoEspecialidades[especialidad] = { sumaPromedio: 0, conteo: 0 };
            }
            agrupadoEspecialidades[especialidad].sumaPromedio += item.promedio_ponderado_promedio || 0;
            agrupadoEspecialidades[especialidad].conteo += 1;
          }
        });

        // Convertir el mapeo en una lista adecuada para pintar el gráfico
        const listadoGrafico = Object.keys(agrupadoEspecialidades).map(esp => {
          const datosEsp = agrupadoEspecialidades[esp];
          const promedio = datosEsp.conteo > 0 ? Math.round((datosEsp.sumaPromedio / datosEsp.conteo) * 10) / 10 : 0;
          return {
            nombre: esp,
            valor: promedio,
            // Porcentaje referencial para el ancho de la barra (base vigesimal 0-20)
            porcentaje: Math.min(100, Math.max(10, (promedio / 20) * 100))
          };
        });

        // Si no hay datos, poblar con nombres vacíos pero estructura válida
        if (listadoGrafico.length === 0) {
          listadoGrafico.push(
            { nombre: "Ing. Sistemas", valor: 0, porcentaje: 10 },
            { nombre: "Ing. Civil", valor: 0, porcentaje: 10 }
          );
        }

        setMetricas({
          ppaGlobal,
          tasaAprobacion,
          cargaDocente: promedioCargaDocente,
          certificadosEmitidos: totalCertificados,
          totalMatriculados: 0,
          validacionesPendientes: 0,
          tasasPago: 0,
          seccionesAperturadas: 0
        });
        setDatosGrafico(listadoGrafico);
        setBitacora(auditoriaReciente);

      } else {
        // --- PANEL DE ADMINISTRACIÓN DE CONTROL ---
        // Matriculas y secciones son independientes entre si: se piden en
        // paralelo en vez de una tras otra.
        const [resultadoMatriculas, resultadoSecciones] = idPeriodoActivo
          ? await Promise.allSettled([
              listarMatriculasAdmin(idPeriodoActivo),
              obtenerSecciones('', '', idPeriodoActivo)
            ])
          : [{ status: 'fulfilled', value: null }, { status: 'fulfilled', value: null }];

        let matriculas = [];
        if (resultadoMatriculas.status === 'fulfilled' && resultadoMatriculas.value) {
          matriculas = resultadoMatriculas.value.matriculas || [];
        } else if (resultadoMatriculas.status === 'rejected') {
          console.error("Error al obtener matrículas para administrador:", resultadoMatriculas.reason);
        }

        let totalSecciones = 0;
        if (resultadoSecciones.status === 'fulfilled' && resultadoSecciones.value) {
          totalSecciones = (resultadoSecciones.value.secciones || []).length;
        } else if (resultadoSecciones.status === 'rejected') {
          console.error("Error al obtener secciones para administrador:", resultadoSecciones.reason);
        }

        const validacionesPendientes = matriculas.filter(m => m.estado === 'pendiente').length;
        const totalPagos = matriculas.reduce((sum, m) => sum + (m.pago && m.pago.estado === 'confirmado' ? m.pago.monto : 0), 0);

        // Agrupar matrículas por estado para el gráfico
        const conteoEstados = { pendiente: 0, confirmada: 0, rechazada: 0 };
        matriculas.forEach(m => {
          if (m.estado === 'pendiente') {
            conteoEstados.pendiente += 1;
          } else if (m.estado === 'confirmada' || m.estado === 'pagada' || m.estado === 'validada') {
            conteoEstados.confirmada += 1;
          } else if (m.estado === 'rechazada' || m.estado === 'desaprobada') {
            conteoEstados.rechazada += 1;
          }
        });

        const totalGeneralMatriculas = matriculas.length || 1;
        const porcentajeConfirmadas = (conteoEstados.confirmada / totalGeneralMatriculas) * 100;
        const porcentajePendientes = (conteoEstados.pendiente / totalGeneralMatriculas) * 100;
        const porcentajeRechazadas = (conteoEstados.rechazada / totalGeneralMatriculas) * 100;

        const graficoMatriculas = [
          { nombre: 'Confirmadas', valor: `${Math.round(porcentajeConfirmadas)}%`, porcentaje: Math.max(10, porcentajeConfirmadas), claseColor: 'bg-primary' },
          { nombre: 'Pendientes', valor: `${Math.round(porcentajePendientes)}%`, porcentaje: Math.max(10, porcentajePendientes), claseColor: 'bg-accent' },
          { nombre: 'Rechazadas', valor: `${Math.round(porcentajeRechazadas)}%`, porcentaje: Math.max(10, porcentajeRechazadas), claseColor: 'bg-red-500' }
        ];

        setMetricas({
          ppaGlobal: 0,
          tasaAprobacion: 0,
          cargaDocente: 0,
          certificadosEmitidos: 0,
          totalMatriculados: matriculas.length,
          validacionesPendientes,
          tasasPago: totalPagos,
          seccionesAperturadas: totalSecciones
        });
        setDatosGrafico(graficoMatriculas);

        // Bitácora de solicitudes de matrícula recientes (últimas 4)
        const solicitudesRecientes = matriculas.slice(0, 4);
        setBitacora(solicitudesRecientes);
      }

    } catch (err) {
      console.error("Error general en el dashboard:", err);
      setError("Ocurrió un error al conectar con el servidor para cargar las estadísticas.");
    } finally {
      setCargando(false);
    }
  }

  // Efecto que corre al montar la vista o cuando cambia el rol/prop de dirección
  useEffect(() => {
    cargarDatosDashboard();
  }, [esDireccion]);

  // Renderizado del Skeleton de Carga (Premium UI)
  if (cargando) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`bg-white border border-border p-6 flex flex-col gap-4 h-36 ${claseContenedor}`}>
              <div className={`h-4 bg-slate-200 w-2/3 ${claseBadge}`}></div>
              <div className={`h-8 bg-slate-200 w-1/3 mt-2 ${claseBadge}`}></div>
              <div className={`h-3 bg-slate-200 w-5/6 mt-2 ${claseBadge}`}></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className={`bg-white border border-border p-8 h-80 flex flex-col gap-4 ${claseContenedor}`}>
            <div className={`h-5 bg-slate-200 w-1/3 ${claseBadge}`}></div>
            <div className={`h-3 bg-slate-200 w-1/2 ${claseBadge}`}></div>
            <div className={`h-full bg-slate-100 mt-4 ${claseBadge}`}></div>
          </div>
          <div className={`bg-white border border-border p-8 h-80 flex flex-col gap-4 ${claseContenedor}`}>
            <div className={`h-5 bg-slate-200 w-1/3 ${claseBadge}`}></div>
            <div className={`h-3 bg-slate-200 w-1/2 ${claseBadge}`}></div>
            <div className={`h-full bg-slate-100 mt-4 ${claseBadge}`}></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado de la Pantalla de Error (Premium UI)
  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 p-8 flex flex-col items-center justify-center gap-4 text-center max-w-lg mx-auto my-12 ${claseContenedor}`}>
        <h4 className="font-heading text-lg font-bold">Error de Conexión</h4>
        <p className="text-sm leading-relaxed text-red-600">{error}</p>
        <button 
          onClick={cargarDatosDashboard}
          className={`mt-2 flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium hover:bg-red-700 active:scale-95 transition-all shadow ${claseBoton}`}
        >
          <RefreshCw size={16} /> Reintentar Carga
        </button>
      </div>
    );
  }

  // Renderizado Principal del Dashboard
  return (
    <div className="flex flex-col gap-8 animate-slide-up">
      
      {/* Indicador del Periodo Académico Activo */}
      <div className={`flex justify-between items-center bg-slate-50 border border-border px-6 py-4 ${claseContenedor}`}>
        <div className="flex flex-col text-left">
          <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Periodo Académico Actual</span>
          <span className="text-lg font-extrabold text-text-heading">{periodoActivo ? periodoActivo.nombre : 'Sin Periodo Activo'}</span>
        </div>
        <button 
          onClick={cargarDatosDashboard} 
          className={`p-2 hover:bg-slate-200 border border-slate-200 bg-white transition-colors ${claseBoton}`}
          title="Actualizar datos"
        >
          <RefreshCw size={18} className="text-text-muted" />
        </button>
      </div>

      {/* Cuadrícula de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Tarjeta 1 */}
        <div className={`bg-white border border-border p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-primary ${claseContenedor}`}>
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight text-left">
              {esDireccion ? 'Promedio Ponderado Acumulado' : 'Total Alumnos Matriculados'}
            </span>
            <span className={`flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 bg-emerald-100 text-emerald-600 ${claseBadge}`}>
              <TrendingUp size={12} /> {esDireccion ? 'General' : 'Activos'}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none text-left">
            {esDireccion ? metricas.ppaGlobal.toFixed(2) : metricas.totalMatriculados.toLocaleString()}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed text-left">
            {esDireccion 
              ? 'Promedio general ponderado de estudiantes de pregrado.' 
              : `Estudiantes registrados en el periodo académico ${periodoActivo ? periodoActivo.nombre : ''}.`}
          </p>
        </div>
        
        {/* Tarjeta 2 */}
        <div className={`bg-white border border-border p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-accent ${claseContenedor}`}>
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight text-left">
              {esDireccion ? 'Tasa de Aprobación General' : 'Validaciones Pendientes'}
            </span>
            <span className={`flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 ${
              esDireccion || metricas.validacionesPendientes === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            } ${claseBadge}`}>
              {esDireccion ? <><TrendingUp size={12} /> %</> : <><Clock size={12} /> Por revisar</>}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none text-left">
            {esDireccion ? `${metricas.tasaAprobacion.toFixed(1)}%` : metricas.validacionesPendientes}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed text-left">
            {esDireccion 
              ? 'Porcentaje de aprobaciones de los cursos calificados.' 
              : 'Fichas de matrícula en espera de confirmación de requisitos.'}
          </p>
        </div>

        {/* Tarjeta 3 */}
        <div className={`bg-white border border-border p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-blue-500 ${claseContenedor}`}>
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight text-left">
              {esDireccion ? 'Carga Horaria Docente' : 'Tasas de Pago Registradas'}
            </span>
            <span className={`flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 bg-slate-100 text-slate-500 ${claseBadge}`}>
              {esDireccion ? <Minus size={12} /> : <><TrendingUp size={12} /> Recaudado</>}
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none text-left">
            {esDireccion ? `${metricas.cargaDocente} hrs` : `S/. ${(metricas.tasasPago / 1000).toFixed(1)}K`}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed text-left">
            {esDireccion 
              ? 'Promedio de horas lectivas semanales por docente asignado.' 
              : `Monto total recaudado por concepto de matrícula en caja (S/. ${metricas.tasasPago.toLocaleString()}).`}
          </p>
        </div>

        {/* Tarjeta 4 */}
        <div className={`bg-white border border-border p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md border-t-4 border-t-emerald-500 ${claseContenedor}`}>
          <div className="flex justify-between items-start gap-2">
            <span className="text-[0.85rem] font-bold text-text-muted uppercase tracking-wider leading-tight text-left">
              {esDireccion ? 'Certificados Emitidos' : 'Secciones Aperturadas'}
            </span>
            <span className={`flex items-center gap-0.5 text-[0.75rem] font-bold py-0.5 px-1.5 bg-emerald-100 text-emerald-600 ${claseBadge}`}>
              <TrendingUp size={12} /> Total
            </span>
          </div>
          <div className="font-heading text-[2.25rem] font-extrabold text-text-heading leading-none text-left">
            {esDireccion ? metricas.certificadosEmitidos : metricas.seccionesAperturadas}
          </div>
          <p className="text-[0.78rem] text-text-muted leading-relaxed text-left">
            {esDireccion 
              ? 'Documentos académicos validados e impresos con código QR.' 
              : 'Aulas y secciones programadas para el periodo actual.'}
          </p>
        </div>
      </div>

      {/* Gráficos y Bitácora */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        
        {/* Gráfico Customizado en CSS */}
        <div className={`bg-white border border-border p-6 md:p-8 shadow-md ${claseContenedor}`}>
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1 text-left">
            <BarChart3 size={20} /> {esDireccion ? 'Rendimiento Académico por Especialidad' : 'Distribución por Estado de Matrícula'}
          </h3>
          <p className="text-[0.88rem] text-text-muted mb-7 text-left">Resumen visual de los indicadores críticos del periodo lectivo.</p>
          
          <div className="flex flex-col gap-5">
            {esDireccion ? (
              // Gráfico para Dirección: Promedio de Rendimiento Ponderado por Carrera
              datosGrafico.map((item, index) => (
                <div key={index} className="grid grid-cols-[140px_1fr_50px] gap-4 items-center">
                  <span className="text-[0.88rem] font-semibold text-text-heading text-left truncate" title={item.nombre}>{item.nombre}</span>
                  <div className={`h-3 bg-slate-200 overflow-hidden ${claseBarra}`}>
                    <div 
                      className={`h-full transition-all duration-1000 animate-slide-right ${claseBarra} ${
                        index % 4 === 0 ? 'bg-primary' : index % 4 === 1 ? 'bg-accent' : index % 4 === 2 ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} 
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-[0.88rem] font-bold text-text-heading text-right">
                    {item.valor.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              // Gráfico para Administrador: Porcentaje de Matrículas por Estado
              datosGrafico.map((item, index) => (
                <div key={index} className="grid grid-cols-[140px_1fr_50px] gap-4 items-center">
                  <span className="text-[0.88rem] font-semibold text-text-heading text-left truncate">{item.nombre}</span>
                  <div className={`h-3 bg-slate-200 overflow-hidden ${claseBarra}`}>
                    <div 
                      className={`h-full transition-all duration-1000 animate-slide-right ${claseBarra} ${item.claseColor}`} 
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                  <span className="text-[0.88rem] font-bold text-text-heading text-right">
                    {item.valor}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Solicitudes / Bitácora Recientes */}
        <div className={`bg-white border border-border p-6 md:p-8 shadow-md ${claseContenedor}`}>
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1 text-left">
            <History size={20} /> {esDireccion ? 'Control de Auditoría y Bitácora' : 'Solicitudes de Matrícula Recientes'}
          </h3>
          <p className="text-[0.88rem] text-text-muted mb-7 text-left">Registro inmediato de operaciones críticas en el sistema.</p>

          <div className="flex flex-col gap-6 relative after:content-[''] after:absolute after:top-1.5 after:bottom-1.5 after:left-[5px] after:w-[2px] after:bg-slate-200">
            {esDireccion ? (
              // Bitácora de Auditoría para Dirección
              bitacora.length > 0 ? (
                bitacora.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    <span className={`w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 shadow-[0_0_0_2px] ${
                      item.accion.includes('error') || item.accion.includes('fallido')
                        ? 'bg-red-500 shadow-red-200' 
                        : item.accion.includes('login') 
                        ? 'bg-blue-500 shadow-blue-200' 
                        : 'bg-emerald-500 shadow-emerald-200'
                    }`}></span>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                        <strong>{item.usuario_username || 'Usuario'}:</strong> {item.accion} en la tabla <span className={`font-mono text-xs bg-slate-100 px-1 py-0.5 text-slate-600 ${claseBadge}`}>{item.tabla}</span>
                      </span>
                      <span className="text-[0.75rem] text-text-muted">{formatearTiempo(item.fecha)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-text-muted text-sm py-4">No se han registrado auditorías recientes.</div>
              )
            ) : (
              // Solicitudes Recientes para Administrador
              bitacora.length > 0 ? (
                bitacora.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    <span className={`w-3 h-3 rounded-full border-2 border-white shrink-0 mt-1.5 z-10 shadow-[0_0_0_2px] ${
                      item.estado === 'pendiente' 
                        ? 'bg-accent shadow-amber-200' 
                        : item.estado === 'rechazada' 
                        ? 'bg-red-500 shadow-red-200' 
                        : 'bg-primary shadow-emerald-200'
                    }`}></span>
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[0.88rem] text-text-main leading-relaxed font-medium">
                        Matrícula de {item.estudiante_nombre} ({item.estudiante_codigo}) en estado <strong>{item.estado}</strong> con {item.total_creditos} créditos.
                      </span>
                      <span className="text-[0.75rem] text-text-muted">{formatearTiempo(item.fecha_matricula)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-text-muted text-sm py-4">No hay solicitudes de matrícula en este periodo.</div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
