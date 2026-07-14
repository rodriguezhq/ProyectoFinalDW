import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    ChevronLeft,
    BookOpen,
    FileText,
    UploadCloud,
    Download,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Loader2,
    Award,
    Pencil
} from 'lucide-react';
import { obtenerDetalleCursoDocente, subirSilaboCurso } from '../../services/servicioCursos';

export default function DetalleCursoDocente() {
    const { id_curso } = useParams();
    const [searchParams] = useSearchParams();
    const idPeriodo = searchParams.get('id_periodo');
    const navegar = useNavigate();

    const [detalleAsignatura, setDetalleAsignatura] = useState(null);
    const [cargandoDetalle, setCargandoDetalle] = useState(true);
    const [subiendoSilabo, setSubiendoSilabo] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

    useEffect(() => {
        if (id_curso && idPeriodo) {
            cargarDetalle();
        } else {
            toast.error('Faltan parámetros de consulta para la asignatura.');
            navegar('/docente/cursos');
        }
    }, [id_curso, idPeriodo]);

    const cargarDetalle = async () => {
        try {
            setCargandoDetalle(true);
            const datos = await obtenerDetalleCursoDocente(id_curso, idPeriodo);
            setDetalleAsignatura(datos);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el detalle de la asignatura.');
            navegar('/docente/cursos');
        } finally {
            setCargandoDetalle(false);
        }
    };

    const manejarSeleccionArchivo = (evento) => {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        // Validar tipo de archivo
        if (archivo.type !== 'application/pdf') {
            toast.error('Solo se permiten archivos en formato PDF.');
            return;
        }

        // Validar tamaño de archivo (limitar a 5MB)
        if (archivo.size > 5 * 1024 * 1024) {
            toast.error('El archivo excede el límite de tamaño permitido (5MB).');
            return;
        }

        setArchivoSeleccionado(archivo);
    };

    const manejarSubidaSilabo = async (evento) => {
        evento.preventDefault();
        if (!archivoSeleccionado) {
            toast.error('Por favor, selecciona un archivo PDF primero.');
            return;
        }

        try {
            setSubiendoSilabo(true);
            await subirSilaboCurso(id_curso, archivoSeleccionado);
            toast.success('Sílabo cargado correctamente. Se encuentra en estado Pendiente.');
            setArchivoSeleccionado(null);
            cargarDetalle(); // Recargar datos
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al cargar el sílabo en el servidor.');
        } finally {
            setSubiendoSilabo(false);
        }
    };

    const obtenerUrlDescarga = (rutaRelativa) => {
        const urlBase = import.meta.env.VITE_API_BASE_URL || '';
        return `${urlBase}/${rutaRelativa}`;
    };

    if (cargandoDetalle) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando detalles de la asignatura...</p>
            </div>
        );
    }

    if (!detalleAsignatura) return null;

    const { curso, periodo, silabo } = detalleAsignatura;
    const esPeriodoActivo = periodo.activo;

    return (
        <div className="mx-auto py-2 px-4 sm:px-6 lg:px-2 space-y-6 animate-fade-in">
            {/* Botón de Retorno */}
            <button
                type="button"
                onClick={() => navegar(`/docente/cursos?id_periodo=${idPeriodo}`)}
                className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-sm font-bold cursor-pointer"
            >
                <ChevronLeft size={16} />
                Volver a Cursos Asignados
            </button>

            {/* Cabecera del Curso */}
            <div className="bg-white border border-border p-6 rounded-none shadow-none space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                            Código del Curso: {curso.codigo}
                        </span>
                        <h1 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                            {curso.nombre}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                            Ciclo {curso.ciclo}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-extrabold bg-slate-50 text-text-muted border border-border">
                            {curso.creditos} Créditos
                        </span>
                    </div>
                </div>

                <div className="border-t border-border/75 pt-3.5 flex flex-wrap gap-x-8 gap-y-2 justify-between items-center text-xs font-semibold text-text-muted">
                    <div>
                        <span className="uppercase text-[0.68rem] text-text-muted block">Especialidad / Carrera</span>
                        <span className="text-text-heading text-[0.92rem] font-bold mt-0.5 block">{curso.especialidad_nombre}</span>
                    </div>
                    <div>
                        <span className="uppercase text-[0.68rem] text-text-muted block">Periodo Académico</span>
                        <span className="text-text-heading text-[0.92rem] font-bold mt-0.5 block">{periodo.nombre}</span>
                    </div>
                    <div>
                        <span className="uppercase text-[0.68rem] text-text-muted block">Estado del Periodo</span>
                        {esPeriodoActivo ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                Activo / Abierto
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-xs font-bold bg-slate-100 text-text-muted border border-border mt-1">
                                Cerrado / Lectura
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel de Calificaciones */}
                <div className="bg-white border border-border p-6 rounded-none shadow-none space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-primary border-b border-border pb-3">
                            <Award size={20} />
                            <h2 className="font-heading font-extrabold text-text-heading text-lg">
                                Registro de Evaluaciones
                            </h2>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed">
                            {esPeriodoActivo
                                ? 'El periodo académico está activo. Puedes registrar, actualizar o modificar las notas de los estudiantes matriculados en este curso.'
                                : 'El periodo académico se encuentra cerrado. Puedes visualizar la nómina completa de estudiantes y sus calificaciones correspondientes en modo lectura.'}
                        </p>
                    </div>

                    <div className="pt-6">
                        {esPeriodoActivo ? (
                            <button
                                type="button"
                                onClick={() => navegar(`/docente/cursos/${id_curso}/calificaciones?id_periodo=${idPeriodo}`)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white hover:bg-primary-hover rounded-none font-bold text-sm shadow-xs transition-all cursor-pointer"
                            >
                                <Pencil size={16} />
                                Ingresar Calificaciones
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => navegar(`/docente/cursos/${id_curso}/calificaciones?id_periodo=${idPeriodo}`)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-border hover:border-primary hover:text-primary rounded-none font-bold text-sm shadow-xs transition-all cursor-pointer"
                            >
                                Ver Calificaciones (Solo Lectura)
                            </button>
                        )}
                    </div>
                </div>

                {/* Panel del Sílabo */}
                <div className="bg-white border border-border p-6 rounded-none shadow-none space-y-6">
                    <div className="flex items-center gap-2.5 text-primary border-b border-border pb-3">
                        <FileText size={20} />
                        <h2 className="font-heading font-extrabold text-text-heading text-lg">
                            Sílabo del Curso
                        </h2>
                    </div>

                    {/* Estado del Sílabo */}
                    <div className="bg-bg-alt/75 p-4 rounded-none border border-border flex items-center gap-3">
                        {silabo ? (
                            <>
                                <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                                <div className="grow">
                                    <p className="text-xs font-semibold text-text-muted uppercase">Estado de Sílabo</p>
                                    <p className="text-sm font-bold text-text-heading">
                                        Cargado - <span className="capitalize font-extrabold text-primary">{silabo.estado}</span>
                                    </p>
                                </div>
                                <a
                                    href={obtenerUrlDescarga(silabo.archivo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-border hover:border-primary hover:text-primary text-xs font-bold rounded-none shadow-xs transition-all"
                                >
                                    <Download size={14} />
                                    Descargar
                                </a>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                <div className="grow">
                                    <p className="text-xs font-semibold text-text-muted uppercase">Estado de Sílabo</p>
                                    <p className="text-sm font-bold text-text-heading">No registrado</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Carga del Sílabo (Solo si el periodo está activo) */}
                    {esPeriodoActivo ? (
                        <form onSubmit={manejarSubidaSilabo} className="space-y-4 pt-2">
                            <label className="block text-xs font-bold text-text-muted uppercase">
                                {silabo ? 'Actualizar Sílabo (PDF)' : 'Subir Sílabo (PDF)'}
                            </label>

                            <div className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-none p-6 text-center cursor-pointer relative bg-bg-alt/25 transition-all">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={manejarSeleccionArchivo}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={subiendoSilabo}
                                />
                                <UploadCloud className="mx-auto text-text-muted opacity-60 mb-2" size={36} />
                                <span className="block text-sm font-bold text-text-heading">
                                    {archivoSeleccionado ? archivoSeleccionado.name : 'Selecciona o arrastra tu archivo PDF'}
                                </span>
                                <span className="block text-xs text-text-muted mt-1 font-semibold">
                                    Tamaño máximo permitido: 5MB
                                </span>
                            </div>

                            {archivoSeleccionado && (
                                <button
                                    type="submit"
                                    disabled={subiendoSilabo}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-none font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {subiendoSilabo ? (
                                        <>
                                            <Loader2 className="animate-spin" size={14} />
                                            Subiendo archivo...
                                        </>
                                    ) : (
                                        <>
                                            Confirmar Carga
                                        </>
                                    )}
                                </button>
                            )}
                        </form>
                    ) : (
                        !silabo && (
                            <div className="p-4 bg-slate-50 border border-border rounded-none text-center">
                                <p className="text-sm font-medium text-text-muted">
                                    No se cargó el sílabo para esta asignatura en este periodo.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
