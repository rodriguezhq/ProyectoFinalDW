import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    BookOpen,
    Calendar,
    Clock,
    ArrowRight,
    Loader2,
    GraduationCap
} from 'lucide-react';
import { obtenerPeriodosDocente, obtenerCursosDocentePorPeriodo } from '../../services/servicioCursos';

export default function CursosAsignadosDocente() {
    const navegar = useNavigate();
    const [listaPeriodos, setListaPeriodos] = useState([]);
    const [idPeriodoSeleccionado, setIdPeriodoSeleccionado] = useState('');
    const [listaAsignaturas, setListaAsignaturas] = useState([]);
    const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
    const [cargandoAsignaturas, setCargandoAsignaturas] = useState(false);

    useEffect(() => {
        cargarPeriodosIniciales();
    }, []);

    const cargarPeriodosIniciales = async () => {
        try {
            setCargandoPeriodos(true);
            const periodosObtenidos = await obtenerPeriodosDocente();
            setListaPeriodos(periodosObtenidos);

            if (periodosObtenidos.length > 0) {
                // Buscar si existe un periodo activo
                const periodoActivo = periodosObtenidos.find(p => p.estado === 'activo');
                const idInicial = periodoActivo ? periodoActivo.id_periodo.toString() : periodosObtenidos[0].id_periodo.toString();
                setIdPeriodoSeleccionado(idInicial);
                cargarAsignaturas(idInicial);
            }
        } catch (errorCarga) {
            console.error(errorCarga);
            toast.error('No se pudieron cargar los periodos académicos.');
        } finally {
            setCargandoPeriodos(false);
        }
    };

    const cargarAsignaturas = async (idPeriodo) => {
        try {
            setCargandoAsignaturas(true);
            const asignaturasObtenidas = await obtenerCursosDocentePorPeriodo(idPeriodo);
            setListaAsignaturas(asignaturasObtenidas);
        } catch (errorCarga) {
            console.error(errorCarga);
            toast.error('No se pudieron cargar las asignaturas asignadas.');
        } finally {
            setCargandoAsignaturas(false);
        }
    };

    const manejarCambioPeriodo = (evento) => {
        const idPeriodo = evento.target.value;
        setIdPeriodoSeleccionado(idPeriodo);
        if (idPeriodo) {
            cargarAsignaturas(idPeriodo);
        } else {
            setListaAsignaturas([]);
        }
    };

    if (cargandoPeriodos) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando periodos académicos...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto py-2 px-4 sm:px-6 lg:px-2 space-y-6 animate-fade-in">
            {/* Cabecera de la Página */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                        Cursos Asignados
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        Visualiza y gestiona las asignaturas programadas bajo tu dirección en cada ciclo lectivo.
                    </p>
                </div>
            </div>

            {listaPeriodos.length === 0 ? (
                <div className="p-8 bg-amber-50 border border-amber-200 rounded-none text-center">
                    <p className="font-bold text-amber-800">Sin historial académico</p>
                    <p className="text-sm text-amber-700 mt-1">No se encontraron periodos académicos asignados a tu cuenta docente.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Selector de Periodo Académico */}
                    <div className="bg-bg-alt p-5 border border-border rounded-none flex flex-col md:flex-row items-center gap-4 shadow-sm">
                        <div className="flex items-center gap-2.5 text-primary shrink-0">
                            <Calendar size={20} />
                            <span className="font-heading font-extrabold text-text-heading text-sm uppercase tracking-wider">
                                Periodo Académico:
                            </span>
                        </div>
                        <select
                            className="grow w-full py-2.5 px-4 bg-white border border-border rounded-lg text-text-heading text-[0.92rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-xs cursor-pointer transition-colors"
                            value={idPeriodoSeleccionado}
                            onChange={manejarCambioPeriodo}
                        >
                            {listaPeriodos.map(periodo => (
                                <option key={periodo.id_periodo} value={periodo.id_periodo}>
                                    {periodo.nombre} {periodo.estado === 'activo' ? '(Periodo Activo)' : '(Cerrado)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Listado de Asignaturas */}
                    {cargandoAsignaturas ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-text-muted text-xs font-semibold">Cargando asignaturas...</p>
                        </div>
                    ) : listaAsignaturas.length === 0 ? (
                        <div className="p-12 bg-white border border-border rounded-none text-center shadow-xs">
                            <BookOpen size={40} className="mx-auto text-text-muted mb-3 opacity-60" />
                            <p className="font-bold text-text-heading text-lg">No tienes asignaturas registradas</p>
                            <p className="text-sm text-text-muted mt-1">No se detectó carga académica programada para tu cuenta en este periodo.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listaAsignaturas.map((asignatura) => {
                                const periodo = listaPeriodos.find(p => p.id_periodo.toString() === idPeriodoSeleccionado);
                                const esPeriodoActivo = periodo?.estado === 'activo';

                                return (
                                    <div
                                        key={asignatura.id_curso}
                                        className="bg-white border border-border rounded-none shadow-xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                                    >
                                        <div className="p-5 space-y-4">
                                            {/* Cabecera del Card */}
                                            <div className="flex justify-between items-start gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                                    Sección {asignatura.codigo}
                                                </span>
                                                {esPeriodoActivo ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-slate-100 text-text-muted border border-border">
                                                        Lectura
                                                    </span>
                                                )}
                                            </div>

                                            {/* Detalles del Curso */}
                                            <div>
                                                <h3 className="font-heading font-extrabold text-text-heading text-base leading-snug hover:text-primary transition-colors">
                                                    {asignatura.curso_nombre}
                                                </h3>
                                                <p className="text-xs text-text-muted font-mono mt-1 font-semibold">
                                                    Código: {asignatura.id_curso}
                                                </p>
                                            </div>

                                            {/* Horario */}
                                            <div className="flex items-center gap-2 text-text-muted text-xs font-semibold pt-1">
                                                <Clock size={14} className="text-primary/75" />
                                                <span>{asignatura.horario}</span>
                                            </div>
                                        </div>

                                        {/* Botón Acción */}
                                        <div className="border-t border-border p-4 bg-bg-alt/45 rounded-b-xl">
                                            <button
                                                type="button"
                                                onClick={() => navegar(`/docente/cursos/${asignatura.id_curso}?id_periodo=${idPeriodoSeleccionado}`)}
                                                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white border border-border hover:border-primary hover:text-primary rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer"
                                            >
                                                Ver Detalles
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
