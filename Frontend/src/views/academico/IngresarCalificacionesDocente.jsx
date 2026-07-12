import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
    ChevronLeft, 
    BookOpen, 
    FileSpreadsheet, 
    Loader2, 
    RefreshCw, 
    Save, 
    AlertTriangle, 
    CheckCircle2 
} from 'lucide-react';
import { obtenerDetalleCursoDocente, obtenerEstudiantesCursoDocente } from '../../services/servicioCursos';
import { registrarNotas } from '../../services/servicioNotas';

export default function IngresarCalificacionesDocente() {
    const { id_curso } = useParams();
    const [searchParams] = useSearchParams();
    const idPeriodo = searchParams.get('id_periodo');
    const navegar = useNavigate();

    const [detalleCurso, setDetalleCurso] = useState(null);
    const [nominaEstudiantes, setNominaEstudiantes] = useState([]);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [cargandoTabla, setCargandoTabla] = useState(false);
    
    // Estado local para los inputs de calificaciones de los estudiantes
    const [calificacionesLocales, setCalificacionesLocales] = useState({});
    const [idsGuardando, setIdsGuardando] = useState({});

    useEffect(() => {
        if (id_curso && idPeriodo) {
            cargarDatosIniciales();
        } else {
            toast.error('Faltan parámetros de consulta para la asignatura.');
            navegar('/docente/cursos');
        }
    }, [id_curso, idPeriodo]);

    const cargarDatosIniciales = async () => {
        try {
            setCargandoDatos(true);
            const datosDetalle = await obtenerDetalleCursoDocente(id_curso, idPeriodo);
            setDetalleCurso(datosDetalle);
            
            const estudiantesNotas = await obtenerEstudiantesCursoDocente(id_curso, idPeriodo);
            setNominaEstudiantes(estudiantesNotas);
            inicializarCalificacionesLocales(estudiantesNotas);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la información del curso y estudiantes.');
            navegar(`/docente/cursos?id_periodo=${idPeriodo}`);
        } finally {
            setCargandoDatos(false);
        }
    };

    const sincronizarCalificaciones = async () => {
        try {
            setCargandoTabla(true);
            const estudiantesNotas = await obtenerEstudiantesCursoDocente(id_curso, idPeriodo);
            setNominaEstudiantes(estudiantesNotas);
            inicializarCalificacionesLocales(estudiantesNotas);
            toast.success('Calificaciones sincronizadas con éxito.');
        } catch (error) {
            console.error(error);
            toast.error('Error al sincronizar las calificaciones.');
        } finally {
            setCargandoTabla(false);
        }
    };

    const inicializarCalificacionesLocales = (listaEstudiantes) => {
        const estadoInicial = {};
        listaEstudiantes.forEach(est => {
            estadoInicial[est.id_matricula_detalle] = {
                parcial1: est.parcial1 !== null ? est.parcial1.toString() : '',
                parcial2: est.parcial2 !== null ? est.parcial2.toString() : '',
                final: est.final !== null ? est.final.toString() : '',
                sustitutorio: est.sustitutorio !== null ? est.sustitutorio.toString() : ''
            };
        });
        setCalificacionesLocales(estadoInicial);
    };

    const manejarCambioInput = (idDetalle, campo, valor) => {
        // Permitir solo números y punto decimal
        const valorLimpio = valor.replace(/[^0-9.]/g, '');
        
        // Evitar múltiples puntos decimales
        const partes = valorLimpio.split('.');
        if (partes.length > 2) return;

        // Validar rango superior de nota (máximo 20)
        if (valorLimpio !== '' && parseFloat(valorLimpio) > 20) {
            return;
        }

        setCalificacionesLocales(prev => ({
            ...prev,
            [idDetalle]: {
                ...prev[idDetalle],
                [campo]: valorLimpio
            }
        }));
    };

    const manejarGuardarNota = async (idDetalle) => {
        const notas = calificacionesLocales[idDetalle];
        if (!notas) return;

        // Validar formato y rango de notas
        const esNotaValida = (val) => {
            if (val === undefined || val === null || val === '') return true;
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0 && num <= 20;
        };

        if (!esNotaValida(notas.parcial1)) {
            toast.error('La nota del Parcial 1 debe estar en el rango de 0 a 20.');
            return;
        }
        if (!esNotaValida(notas.parcial2)) {
            toast.error('La nota del Parcial 2 debe estar en el rango de 0 a 20.');
            return;
        }
        if (!esNotaValida(notas.final)) {
            toast.error('La nota del Examen Final debe estar en el rango de 0 a 20.');
            return;
        }
        if (!esNotaValida(notas.sustitutorio)) {
            toast.error('La nota del Examen Sustitutorio debe estar en el rango de 0 a 20.');
            return;
        }

        try {
            setIdsGuardando(prev => ({ ...prev, [idDetalle]: true }));
            const respuesta = await registrarNotas(idDetalle, notas);
            toast.success(respuesta.msg || 'Notas guardadas correctamente.');
            
            // Recargar datos para recalcular promedios
            const estudiantesActualizados = await obtenerEstudiantesCursoDocente(id_curso, idPeriodo);
            setNominaEstudiantes(estudiantesActualizados);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al guardar las notas del estudiante.');
        } finally {
            setIdsGuardando(prev => ({ ...prev, [idDetalle]: false }));
        }
    };

    const renderBadgeEstadoNota = (estado) => {
        switch (estado) {
            case 'aprobada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aprobado
                    </span>
                );
            case 'desaprobada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        Desaprobado
                    </span>
                );
            case 'registrada':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Registrada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-text-muted border border-border">
                        Sin Notas
                    </span>
                );
        }
    };

    if (cargandoDatos) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando nómina de estudiantes...</p>
            </div>
        );
    }

    if (!detalleCurso) return null;

    const { curso, periodo } = detalleCurso;
    const esPeriodoActivo = periodo.activo;

    return (
        <div className="mx-auto py-2 px-4 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
            {/* Botón de Retorno */}
            <button
                type="button"
                onClick={() => navegar(`/docente/cursos/${id_curso}?id_periodo=${idPeriodo}`)}
                className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-sm font-bold cursor-pointer"
            >
                <ChevronLeft size={16} />
                Volver a Detalle de la Asignatura
            </button>

            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-border">
                <div>
                    <h1 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                        Registro de Notas
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        {curso.nombre} - Ciclo {curso.ciclo} | Periodo {periodo.nombre}
                    </p>
                </div>
                {esPeriodoActivo && (
                    <button 
                        type="button"
                        onClick={sincronizarCalificaciones}
                        disabled={cargandoTabla}
                        className="flex items-center gap-2 border border-border bg-bg-alt text-text-main hover:bg-slate-100 py-2 px-4 rounded-lg font-bold text-sm shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={cargandoTabla ? "animate-spin" : ""} />
                        Sincronizar
                    </button>
                )}
            </div>



            {/* Ficha Resumen de la Asignatura */}
            <div className="bg-bg-alt/75 border border-border p-5 rounded-xl flex flex-wrap gap-x-8 gap-y-3 justify-between items-center shadow-xs">
                <div className="flex flex-col">
                    <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Asignatura</span>
                    <span className="font-bold text-text-heading text-base mt-0.5">{curso.nombre}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Código de Curso</span>
                    <span className="font-mono font-bold text-primary text-base mt-0.5">{curso.codigo}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-wider">Especialidad</span>
                    <span className="font-semibold text-text-heading text-sm mt-1">{curso.especialidad_nombre}</span>
                </div>
            </div>

            {/* Tabla de Calificaciones */}
            <div className="bg-white border border-border p-5 rounded-xl shadow-xs space-y-4">
                <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                    <FileSpreadsheet className="text-primary" size={20} />
                    <h3 className="font-heading font-extrabold text-text-heading text-base">
                        Nómina de Estudiantes y Notas
                    </h3>
                </div>

                {cargandoTabla ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-text-muted text-xs font-semibold">Cargando calificaciones...</p>
                    </div>
                ) : nominaEstudiantes.length === 0 ? (
                    <div className="text-center py-12 bg-bg-alt/25 rounded-xl border border-border">
                        <p className="font-bold text-text-heading text-sm">No se encontraron estudiantes matriculados en este curso</p>
                    </div>
                ) : (
                    <div className="w-full flex flex-col gap-1.5">
                        {esPeriodoActivo && (
                            <span className="text-xs text-text-muted font-semibold self-end">
                                * Las notas son sobre un sistema vigesimal (0 - 20).
                            </span>
                        )}
                        
                        <div className="w-full overflow-x-auto border border-border rounded-xl shadow-xs">
                            <div className="overflow-y-auto max-h-[480px] min-w-[900px]">
                                <table className="w-full text-left border-collapse text-[0.88rem]">
                                    <thead className="bg-bg-alt text-text-heading font-extrabold sticky top-0 z-10 border-b border-border shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                                        <tr>
                                            <th className="p-4 bg-bg-alt">Código</th>
                                            <th className="p-4 bg-bg-alt">Estudiante</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Parcial 1</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Parcial 2</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Ex. Final</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Ex. Sust.</th>
                                            <th className="p-4 text-center bg-bg-alt w-[100px]">Promedio</th>
                                            <th className="p-4 text-center bg-bg-alt w-[110px]">Estado</th>
                                            {esPeriodoActivo && <th className="p-4 text-center bg-bg-alt w-[100px]">Acciones</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border bg-white">
                                        {nominaEstudiantes.map((item) => {
                                            const idDetalle = item.id_matricula_detalle;
                                            const notasLocales = calificacionesLocales[idDetalle] || { parcial1: '', parcial2: '', final: '', sustitutorio: '' };
                                            const guardando = idsGuardando[idDetalle] || false;

                                            const notaAprobada = item.promedio !== null && item.promedio >= 10.5;
                                            const claseColorPromedio = item.promedio === null 
                                                ? 'text-text-muted' 
                                                : (notaAprobada ? 'text-emerald-600 font-extrabold' : 'text-red-600 font-extrabold');

                                            return (
                                                <tr key={idDetalle} className="hover:bg-bg-alt/45 transition-colors">
                                                    <td className="p-4 font-mono text-xs font-semibold text-text-muted">
                                                        {item.estudiante_codigo}
                                                    </td>
                                                    <td className="p-4 font-bold text-text-heading">
                                                        {item.estudiante_nombre}
                                                    </td>
                                                    
                                                    {/* Parcial 1 */}
                                                    <td className="p-4 text-center">
                                                        {esPeriodoActivo ? (
                                                            <input
                                                                type="text"
                                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                                value={notasLocales.parcial1}
                                                                placeholder="-"
                                                                onChange={(e) => manejarCambioInput(idDetalle, 'parcial1', e.target.value)}
                                                                disabled={guardando}
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-text-main">
                                                                {item.parcial1 !== null ? item.parcial1.toFixed(1) : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    
                                                    {/* Parcial 2 */}
                                                    <td className="p-4 text-center">
                                                        {esPeriodoActivo ? (
                                                            <input
                                                                type="text"
                                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                                value={notasLocales.parcial2}
                                                                placeholder="-"
                                                                onChange={(e) => manejarCambioInput(idDetalle, 'parcial2', e.target.value)}
                                                                disabled={guardando}
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-text-main">
                                                                {item.parcial2 !== null ? item.parcial2.toFixed(1) : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    
                                                    {/* Examen Final */}
                                                    <td className="p-4 text-center">
                                                        {esPeriodoActivo ? (
                                                            <input
                                                                type="text"
                                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                                value={notasLocales.final}
                                                                placeholder="-"
                                                                onChange={(e) => manejarCambioInput(idDetalle, 'final', e.target.value)}
                                                                disabled={guardando}
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-text-main">
                                                                {item.final !== null ? item.final.toFixed(1) : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    
                                                    {/* Examen Sustitutorio */}
                                                    <td className="p-4 text-center">
                                                        {esPeriodoActivo ? (
                                                            <input
                                                                type="text"
                                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                                value={notasLocales.sustitutorio}
                                                                placeholder="-"
                                                                onChange={(e) => manejarCambioInput(idDetalle, 'sustitutorio', e.target.value)}
                                                                disabled={guardando}
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-text-main">
                                                                {item.sustitutorio !== null ? item.sustitutorio.toFixed(1) : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    
                                                    {/* Promedio */}
                                                    <td className={`p-4 text-center font-mono ${claseColorPromedio}`}>
                                                        {item.promedio !== null ? item.promedio.toFixed(2) : '-'}
                                                    </td>
                                                    
                                                    {/* Estado */}
                                                    <td className="p-4 text-center">
                                                        {renderBadgeEstadoNota(item.estado)}
                                                    </td>
                                                    
                                                    {/* Acciones */}
                                                    {esPeriodoActivo && (
                                                        <td className="p-4 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => manejarGuardarNota(idDetalle)}
                                                                disabled={guardando}
                                                                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                                                                title="Guardar calificaciones"
                                                            >
                                                                {guardando ? (
                                                                    <Loader2 size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Save size={16} />
                                                                )}
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
