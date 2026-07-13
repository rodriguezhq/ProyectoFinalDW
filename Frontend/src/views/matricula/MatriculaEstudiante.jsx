import React, { useState, useEffect } from 'react';
import {
    Loader2,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Download,
    BookOpen,
    Clock,
    BadgeCheck,
    Plus,
    Trash2,
    CalendarDays,
    HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
    obtenerOfertaAcademica,
    procesarMatricula,
    obtenerUrlFichaPdf
} from '../../services/servicioMatricula';

// Paleta de colores premium para distinguir las asignaturas en el calendario
const PALETA_COLORES = [
    { bg: 'bg-blue-50 border-blue-200 text-blue-800', badge: 'bg-blue-600' },
    { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', badge: 'bg-emerald-600' },
    { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', badge: 'bg-indigo-600' },
    { bg: 'bg-purple-50 border-purple-200 text-purple-800', badge: 'bg-purple-600' },
    { bg: 'bg-amber-50 border-amber-200 text-amber-800', badge: 'bg-amber-600' },
    { bg: 'bg-rose-50 border-rose-200 text-rose-800', badge: 'bg-rose-600' },
    { bg: 'bg-teal-50 border-teal-200 text-teal-800', badge: 'bg-teal-600' },
    { bg: 'bg-sky-50 border-sky-200 text-sky-800', badge: 'bg-sky-600' }
];

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const HORAS_DIA = Array.from({ length: 15 }, (_, i) => i + 8); // de 08:00 AM a 22:00 PM (14 horas)

export default function MatriculaEstudiante() {
    const [cargando, setCargando] = useState(true);
    const [oferta, setOferta] = useState(null);

    // Lista de secciones actualmente agregadas al horario/calendario
    const [seccionesElegidas, setSeccionesElegidas] = useState([]);
    const [procesando, setProcesando] = useState(false);

    const cargarOferta = async () => {
        try {
            setCargando(true);
            const datos = await obtenerOfertaAcademica();
            setOferta(datos);

            // Si ya esta matriculado, reconstruir las secciones en el calendario
            if (datos.ya_matriculado && datos.cursos) {
                const elegidasIniciales = [];
                datos.cursos.forEach((c, index) => {
                    const colorAsignado = PALETA_COLORES[index % PALETA_COLORES.length];
                    elegidasIniciales.push({
                        id_seccion: c.id_seccion || index,
                        codigo: c.seccion_codigo,
                        id_curso: c.id_curso,
                        cursoNombre: c.nombre,
                        creditos: c.creditos,
                        horarios: c.horarios || [],
                        color: colorAsignado
                    });
                });
                setSeccionesElegidas(elegidasIniciales);
            } else {
                setSeccionesElegidas([]);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al cargar la información de matrícula.');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarOferta();
    }, []);

    // Conversión de hora string a minutos
    const aMinutos = (horaStr) => {
        const [h, m] = horaStr.split(':').map(Number);
        return h * 60 + m;
    };

    // Evalúa si una sección genera cruce de horario con los cursos ya agregados al calendario
    const evaluarCruceSeccion = (seccionAProbar, idCursoPadre) => {
        // Ignorar de la validación secciones del mismo curso (ya que se reemplazan al agregar)
        const bloquesExistentes = [];
        seccionesElegidas.forEach(elegida => {
            if (elegida.id_curso !== idCursoPadre) {
                (elegida.horarios || []).forEach(b => {
                    bloquesExistentes.push(b);
                });
            }
        });

        // Bloques a probar
        const bloquesNuevos = seccionAProbar.horarios || [];

        for (const bNuevo of bloquesNuevos) {
            const iniNuevo = aMinutos(bNuevo.horaInicio);
            const finNuevo = aMinutos(bNuevo.horaFin);

            for (const bExistente of bloquesExistentes) {
                if (bNuevo.dia.toUpperCase() === bExistente.dia.toUpperCase()) {
                    const iniExistente = aMinutos(bExistente.horaInicio);
                    const finExistente = aMinutos(bExistente.horaFin);

                    // Si se solapan los rangos de horas
                    if (iniNuevo < finExistente && iniExistente < finNuevo) {
                        return {
                            cruce: true,
                            mensaje: `Cruce el ${bNuevo.dia} a las ${bNuevo.horaInicio} con ${bExistente.curso_nombre || 'otro curso'}`
                        };
                    }
                }
            }
        }

        return { cruce: false, mensaje: '' };
    };

    // Agrega una sección al calendario, removiendo la sección anterior del mismo curso si existía
    const agregarSeccion = (curso, seccion) => {
        // Validar cruce primero
        const resultadoCruce = evaluarCruceSeccion(seccion, curso.id_curso);
        if (resultadoCruce.cruce) {
            toast.error(resultadoCruce.mensaje);
            return;
        }

        // Remover sección previa del mismo curso si existía
        const filtradas = seccionesElegidas.filter(s => s.id_curso !== curso.id_curso);

        // Asignar color distintivo
        const colorIndex = filtradas.length % PALETA_COLORES.length;
        const color = PALETA_COLORES[colorIndex];

        const nuevaElegida = {
            id_seccion: seccion.id_seccion,
            codigo: seccion.codigo,
            id_curso: curso.id_curso,
            cursoNombre: curso.nombre,
            creditos: curso.creditos,
            horarios: seccion.horarios || [],
            color: color
        };

        setSeccionesElegidas([...filtradas, nuevaElegida]);
        toast.success(`Se agregó ${curso.nombre} (Secc. ${seccion.codigo}) al calendario.`);
    };

    // Remueve una sección del calendario
    const removerSeccion = (idCurso) => {
        const filtradas = seccionesElegidas.filter(s => s.id_curso !== idCurso);
        setSeccionesElegidas(filtradas);
        toast.info('Asignatura removida del calendario.');
    };

    // Recupera qué bloque de horario está ocupando una celda específica del calendario
    const obtenerBloqueEnCelda = (dia, hora) => {
        for (const sec of seccionesElegidas) {
            for (const b of (sec.horarios || [])) {
                if (b.dia.toUpperCase() === dia.toUpperCase()) {
                    const [hIni] = b.horaInicio.split(':').map(Number);
                    const [hFin] = b.horaFin.split(':').map(Number);
                    if (hora >= hIni && hora < hFin) {
                        return {
                            cursoNombre: sec.cursoNombre,
                            seccionCodigo: sec.codigo,
                            color: sec.color,
                            inicio: hIni,
                            fin: hFin
                        };
                    }
                }
            }
        }
        return null;
    };

    const manejarEnvioMatricula = async (e) => {
        e.preventDefault();

        if (seccionesElegidas.length === 0) {
            toast.error('Debes agregar al menos un curso al calendario para matricularte.');
            return;
        }

        if (seccionesElegidas.length !== oferta.cursos.length) {
            toast.warning('Aún tienes asignaturas disponibles sin seleccionar en tu ciclo.');
        }

        try {
            setProcesando(true);
            const payloadSecciones = seccionesElegidas.map(s => ({
                id_curso: s.id_curso,
                id_seccion: s.id_seccion
            }));
            await procesarMatricula(payloadSecciones);
            toast.success('¡Matrícula guardada y validada correctamente!');
            await cargarOferta(); // Recargar a modo ya matriculado
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al procesar la matrícula.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={42} />
                <p className="text-text-muted text-sm font-semibold">Cargando información del proceso de matrícula...</p>
            </div>
        );
    }

    if (!oferta) {
        return (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-none text-center text-red-800">
                <AlertTriangle className="mx-auto text-red-600 mb-3" size={32} />
                <h3 className="font-bold text-lg mb-1">Error de Sistema</h3>
                <p className="text-sm">No se pudo cargar la oferta académica en este momento.</p>
                <button
                    onClick={cargarOferta}
                    className="mt-4 px-4 py-2 bg-red-600 text-white font-bold rounded-none hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const totalCreditosElegidos = seccionesElegidas.reduce((acc, s) => acc + s.creditos, 0);

    return (
        <div className=" mx-auto flex flex-col gap-6 animate-fade-in pb-12">

            {/* Header del Proceso */}
            <div className="bg-bg-alt/50 border border-border p-5 rounded-none flex flex-wrap justify-between items-center gap-4 shadow-xs">
                <div className="flex flex-col gap-1">
                    <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Plan de Estudios</span>
                    <h3 className="font-heading font-extrabold text-xl text-text-heading">Matrícula en Línea — Periodo {oferta.periodo_nombre}</h3>
                </div>
                <div className="flex items-center gap-4">
                    {oferta.ya_matriculado ? (
                        oferta.estado === 'confirmada' ? (
                            <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-none flex items-center gap-2 text-emerald-800 text-sm font-bold">
                                <CheckCircle2 className="text-emerald-600" size={18} />
                                Estado: Matrícula Confirmada
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-none flex items-center gap-2 text-amber-800 text-sm font-bold">
                                <Clock className="text-amber-600 animate-pulse" size={18} />
                                Estado: Matrícula Pendiente
                            </div>
                        )
                    ) : (
                        <div className="bg-primary/5 border border-primary/15 px-4 py-2 rounded-none flex items-center gap-2 text-primary text-sm font-bold">
                            <Clock size={18} />
                            Estado: Matrícula Abierta
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Superior: Calendario Semanal de Horario */}
            <div className="bg-white border border-border rounded-none p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-primary" size={22} />
                        <h4 className="font-heading font-bold text-text-heading text-[1.1rem]">Vista Previa del Horario Semanal</h4>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                        <span>Total Créditos Seleccionados: <b className="text-primary text-sm">{totalCreditosElegidos} CR</b></span>
                    </div>
                </div>

                {/* Grilla Horario */}
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed min-w-[700px] border-collapse text-center">
                        <thead>
                            <tr className="border-b border-border bg-bg-alt/20">
                                <th className="py-2.5 px-2 border-r border-border text-[0.7rem] font-bold text-text-muted uppercase w-[80px]">Hora</th>
                                {DIAS_SEMANA.map(dia => (
                                    <th key={dia} className="py-2.5 px-2 border-r border-border text-[0.7rem] font-bold text-text-heading uppercase last:border-r-0">
                                        {dia}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {HORAS_DIA.map(hora => (
                                <tr key={hora} className="border-b border-border hover:bg-bg-alt/10 last:border-none h-11">
                                    <td className="py-1 px-2 border-r border-border font-mono text-[0.72rem] font-bold text-text-muted">
                                        {`${String(hora).padStart(2, '0')}:00`}
                                    </td>
                                    {DIAS_SEMANA.map(dia => {
                                        const bloque = obtenerBloqueEnCelda(dia, hora);
                                        if (bloque) {
                                            // Solo renderizar el contenido completo del bloque en la hora de inicio para evitar repeticiones visuales molestas
                                            const esFilaInicio = bloque.inicio === hora;
                                            return (
                                                <td
                                                    key={dia}
                                                    className={`py-1 px-1 border-r border-border last:border-r-0 text-[0.72rem] leading-tight font-bold transition-all ${bloque.color.bg} border-l-2`}
                                                >
                                                    {esFilaInicio ? (
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className="truncate max-w-full block font-heading">{bloque.cursoNombre}</span>
                                                            <span className="text-[0.62rem] opacity-75 mt-0.5">Secc. {bloque.seccionCodigo}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-1 opacity-20 bg-current rounded-none" />
                                                    )}
                                                </td>
                                            );
                                        }
                                        return (
                                            <td key={dia} className="py-1 px-2 border-r border-border last:border-r-0 text-xs text-text-light italic font-normal" />
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Listado de Cursos y Secciones */}
            {oferta.ya_matriculado ? (
                <div className="flex flex-col gap-6">
                    {/* Banner de confirmación y descarga */}
                    {oferta.estado === 'confirmada' ? (
                        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-none flex flex-col md:flex-row items-center gap-4 text-emerald-900 shadow-xs">
                            <CheckCircle2 className="text-emerald-600 shrink-0" size={36} />
                            <div className="grow text-center md:text-left">
                                <h3 className="font-heading font-extrabold text-lg leading-tight">Matrícula Registrada Oficialmente</h3>
                                <p className="text-sm text-emerald-800 mt-1">Te encuentras matriculado para el Periodo Académico <b>{oferta.periodo_nombre}</b>.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                                <a
                                    href={`${obtenerUrlFichaPdf(oferta.id_matricula)}?tipo=pre`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 text-emerald-800 font-bold text-sm shadow-xs hover:bg-emerald-100/50 transition-all duration-200 cursor-pointer rounded-none"
                                >
                                    <Download size={16} />
                                    Descargar Pre-Ficha
                                </a>
                                <a
                                    href={obtenerUrlFichaPdf(oferta.id_matricula)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold text-sm shadow-xs hover:bg-emerald-700 transition-all duration-200 cursor-pointer rounded-none"
                                >
                                    <Download size={16} />
                                    Descargar Ficha Oficial
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-none flex flex-col md:flex-row items-center gap-4 text-amber-900 shadow-xs">
                            <Clock className="text-amber-600 animate-pulse shrink-0" size={36} />
                            <div className="grow text-center md:text-left">
                                <h3 className="font-heading font-extrabold text-lg leading-tight">Matrícula Pendiente</h3>
                                <p className="text-sm text-amber-800 mt-1">Tu matrícula se encuentra pendiente, el administrador la revisará pronto. Ya puedes descargar tu Constancia de Pre-Matrícula.</p>
                            </div>
                            <a
                                href={`${obtenerUrlFichaPdf(oferta.id_matricula)}?tipo=pre`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-bold text-sm shadow-xs hover:bg-amber-700 transition-all duration-200 shrink-0 cursor-pointer w-full sm:w-auto rounded-none"
                            >
                                <Download size={16} />
                                Descargar Pre-Ficha PDF
                            </a>
                        </div>
                    )}

                    {/* Tabla de asignaturas inscritas y confirmadas */}
                    <div className="bg-white border border-border rounded-none overflow-hidden shadow-xs">
                        <div className="p-5 border-b border-border bg-bg-alt/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BookOpen className="text-primary" size={20} />
                                <h4 className="font-heading font-bold text-text-heading">Asignaturas Matriculadas y Confirmadas</h4>
                            </div>
                            <span className="text-[0.75rem] font-extrabold px-3 py-1 bg-primary/10 text-primary uppercase tracking-wider rounded-none">
                                Total Créditos: {totalCreditosElegidos}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-border text-[0.72rem] font-bold text-text-muted uppercase bg-bg-alt/25">
                                        <th className="py-3 px-5">Código</th>
                                        <th className="py-3 px-5">Asignatura</th>
                                        <th className="py-3 px-5 text-center">Sección</th>
                                        <th className="py-3 px-5 text-center">Créditos</th>
                                        <th className="py-3 px-5 min-w-[200px] sm:min-w-0">Horario Programado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {oferta.cursos.map((c, idx) => (
                                        <tr key={idx} className="border-b border-border hover:bg-bg-alt/25 last:border-none transition-colors">
                                            <td className="py-4 px-5 font-mono text-xs font-bold text-text-muted">{c.codigo}</td>
                                            <td className="py-4 px-5 font-bold text-text-heading">{c.nombre}</td>
                                            <td className="py-4 px-5 text-center font-bold text-primary">{c.seccion_codigo}</td>
                                            <td className="py-4 px-5 text-center font-bold text-text-main">{c.creditos}</td>
                                            <td className="py-4 px-5 text-xs text-text-muted leading-relaxed font-semibold">
                                                {c.horarios && c.horarios.length > 0 ? (
                                                    <div className="flex flex-col gap-0.5">
                                                        {c.horarios.map((h, hIdx) => (
                                                            <div key={hIdx} className="flex items-center gap-1">
                                                                <span className="capitalize text-primary font-bold">{h.dia.toLowerCase()}</span>:
                                                                <span>{h.horaInicio} - {h.horaFin}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="italic text-text-light">Sin horario asignado</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={manejarEnvioMatricula} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <h4 className="font-heading font-bold text-text-heading border-b border-border pb-2">Asignaturas Disponibles de tu Ciclo</h4>

                        {oferta.cursos.map(curso => {
                            const seccionSeleccionada = seccionesElegidas.find(s => s.id_curso === curso.id_curso);

                            return (
                                <div key={curso.id_curso} className="bg-white border border-border p-5 rounded-none flex flex-col gap-4 hover:border-primary/25 transition-all shadow-xs">
                                    {/* Cabecera del Curso */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-mono font-bold text-text-muted">{curso.codigo}</span>
                                            <h5 className="font-heading font-bold text-text-heading text-[1rem] mt-0.5">{curso.nombre}</h5>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-semibold text-text-muted">
                                            <span>Créditos: <b className="text-text-heading">{curso.creditos} CR</b></span>
                                            <span>Ciclo: <b className="text-text-heading">{curso.ciclo}° Ciclo</b></span>
                                        </div>
                                    </div>

                                    {/* Listado de Secciones */}
                                    <div className="flex flex-col gap-3">
                                        {curso.secciones.map(seccion => {
                                            const esAgregada = seccionSeleccionada && seccionSeleccionada.id_seccion === seccion.id_seccion;

                                            // Validar si genera cruce con las demas secciones elegidas
                                            const validacionCruce = evaluarCruceSeccion(seccion, curso.id_curso);
                                            const tieneCruce = validacionCruce.cruce;

                                            return (
                                                <div
                                                    key={seccion.id_seccion}
                                                    className={`p-3.5 border rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${esAgregada ? 'bg-primary/5 border-primary/30' : 'bg-bg-alt/20 border-border/70'}`}
                                                >
                                                    <div className="grow flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2">
                                                        <div className="flex flex-col shrink-0">
                                                            <span className="text-[0.62rem] font-bold text-text-light uppercase tracking-wider">Código Sección</span>
                                                            <span className="text-sm font-bold text-primary">Sección {seccion.codigo}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[0.62rem] font-bold text-text-light uppercase tracking-wider">Horario Programado</span>
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                {seccion.horarios && seccion.horarios.length > 0 ? (
                                                                    seccion.horarios.map((h, hIdx) => (
                                                                        <div key={hIdx} className="flex items-center gap-1.5 text-xs text-text-main font-semibold">
                                                                            <span className="capitalize text-primary-dark font-extrabold">{h.dia.toLowerCase()}</span>:
                                                                            <span className="text-text-muted">{h.horaInicio} - {h.horaFin}</span>
                                                                            {h.docente_nombre && (
                                                                                <span className="text-[0.68rem] text-text-light italic font-normal">({h.docente_nombre})</span>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs italic text-text-light">Sin horario asignado</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Acciones de Selección */}
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        {esAgregada ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => removerSeccion(curso.id_curso)}
                                                                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 font-bold text-xs bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all cursor-pointer rounded-none"
                                                            >
                                                                <Trash2 size={14} />
                                                                Remover Curso
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                disabled={tieneCruce}
                                                                onClick={() => agregarSeccion(curso, seccion)}
                                                                className={`flex items-center gap-1.5 px-4 py-2 font-bold text-xs transition-all rounded-none ${tieneCruce ? 'bg-bg-alt text-text-light border border-border/80 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark cursor-pointer'}`}
                                                            >
                                                                {tieneCruce ? (
                                                                    <>
                                                                        <AlertTriangle size={14} className="text-amber-500" />
                                                                        Genera Cruce
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={14} />
                                                                        Agregar Curso
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Botón flotante / final de matrícula */}
                    <div className="flex items-center justify-between p-4 border-t border-border mt-4 bg-bg-alt/25 rounded-none">
                        <div className="flex flex-col">
                            <span className="text-[0.68rem] font-bold text-text-muted uppercase">Créditos de Matrícula</span>
                            <span className="text-sm font-bold text-text-heading mt-0.5">
                                Has inscrito <b className="text-primary">{totalCreditosElegidos} CR</b> en tu horario
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={procesando || seccionesElegidas.length === 0}
                            className={`flex items-center gap-2 px-6 py-3 font-bold shadow-xs transition-all duration-300 rounded-none ${seccionesElegidas.length === 0 ? 'bg-bg-alt text-text-light cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-primary-dark hover:shadow-md cursor-pointer'}`}
                        >
                            {procesando ? (
                                <>
                                    <Loader2 className="animate-spin" size={16} />
                                    Confirmando Matrícula...
                                </>
                            ) : (
                                'Confirmar y Guardar Matrícula'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
