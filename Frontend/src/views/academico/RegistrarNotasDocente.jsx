import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { BookOpen, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';
import {
    obtenerSeccionesDocente,
    obtenerNotasCurso,
    registrarNotas
} from '../../services/servicioNotas';
import TablaRegistroNotas from './components/TablaRegistroNotas';

export default function RegistrarNotasDocente() {
    const [secciones, setSecciones] = useState([]);
    const [seccionSeleccionada, setSeccionSeleccionada] = useState(null);
    const [notesList, setNotesList] = useState([]);
    const [cargandoSecciones, setCargandoSecciones] = useState(true);
    const [cargandoNotas, setCargandoNotas] = useState(false);

    useEffect(() => {
        cargarSeccionesIniciales();
    }, []);

    const cargarSeccionesIniciales = async () => {
        try {
            setCargandoSecciones(true);
            const datos = await obtenerSeccionesDocente();
            setSecciones(datos);
            if (datos.length > 0) {
                // Seleccionar la primera sección automáticamente
                setSeccionSeleccionada(datos[0]);
                cargarNotasDeCurso(datos[0].id_curso);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'No se pudieron cargar tus secciones asignadas.');
        } finally {
            setCargandoSecciones(false);
        }
    };

    const cargarNotasDeCurso = async (idCurso) => {
        try {
            setCargandoNotas(true);
            const notas = await obtenerNotasCurso(idCurso);
            setNotesList(notas);
        } catch (err) {
            console.error(err);
            toast.error('Error al cargar la lista de estudiantes y notas.');
        } finally {
            setCargandoNotas(false);
        }
    };

    const handleSeccionChange = (e) => {
        const idCurso = parseInt(e.target.value);
        const seccion = secciones.find(s => s.id_curso === idCurso);
        setSeccionSeleccionada(seccion);
        if (seccion) {
            cargarNotasDeCurso(seccion.id_curso);
        } else {
            setNotesList([]);
        }
    };

    const handleSaveGrade = async (idMatriculaDetalle, gradesData) => {
        try {
            const result = await registrarNotas(idMatriculaDetalle, gradesData);
            toast.success(result.msg || 'Notas actualizadas y promedio calculado.');

            // Recargar la lista de notas para reflejar los promedios y estados frescos del backend
            if (seccionSeleccionada) {
                const notasActualizadas = await obtenerNotasCurso(seccionSeleccionada.id_curso);
                setNotesList(notasActualizadas);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Ocurrió un error al registrar las notas.');
            throw err; // Lanza el error para que la tabla detenga el spinner de guardado
        }
    };

    if (cargandoSecciones) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-text-muted text-sm font-semibold">Cargando asignaturas y secciones...</p>
            </div>
        );
    }

    return (
        <div className=" sm:px-6 lg:px-2 space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1 border-b border-border">
                <div>
                    <h1 className="font-heading text-2xl font-extrabold text-text-heading leading-tight">
                        Registro de Evaluaciones
                    </h1>
                    <p className="text-text-muted text-sm mt-1">
                        Ingresa y actualiza las calificaciones de tus alumnos para el periodo académico vigente.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => seccionSeleccionada && cargarNotasDeCurso(seccionSeleccionada.id_curso)}
                    disabled={cargandoNotas || !seccionSeleccionada}
                    className="flex items-center gap-2 border border-border bg-bg-alt text-text-main hover:bg-slate-100 rounded-lg font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw size={15} className={cargandoNotas ? "animate-spin" : ""} />
                    Sincronizar
                </button>
            </div>

            {secciones.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="font-bold text-amber-800">No tienes asignaturas programadas</p>
                    <p className="text-sm text-amber-700 mt-1">No se detectaron cursos bajo tu asignación docente en este ciclo.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {/* Selector de Asignatura */}
                    <div className="bg-bg-alt p-2 border border-border rounded-nonr flex flex-col md:flex-row items-center gap-2">
                        <div className="flex items-center gap-2.5 text-primary shrink-0">
                            <BookOpen size={20} />
                            <span className="font-heading font-extrabold text-text-heading text-sm uppercase tracking-wider">
                                Asignatura / Curso:
                            </span>
                        </div>
                        <select
                            className="grow w-full py-2.5 px-4 bg-white border border-border rounded-lg text-text-heading text-[0.92rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-sm cursor-pointer transition-colors"
                            value={seccionSeleccionada?.id_curso || ''}
                            onChange={handleSeccionChange}
                        >
                            {secciones.map(sec => (
                                <option key={sec.id_curso} value={sec.id_curso}>
                                    {sec.curso_nombre} - [{sec.codigo}]
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Información y Tabla de Notas */}
                    {seccionSeleccionada && (
                        <div className="space-y-4">
                            {/* Ficha Resumen de la Sección */}
                            <div className="bg-white border border-border p-2 rounded-none flex flex-wrap gap-x-8 gap-y-3 justify-between items-center shadow-xs">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Curso Activo</span>
                                    <span className="font-bold text-text-heading text-base mt-0.5">{seccionSeleccionada.curso_nombre}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Sección</span>
                                    <span className="font-mono font-bold text-primary text-base mt-0.5">{seccionSeleccionada.codigo}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Horario Programado</span>
                                    <span className="font-semibold text-text-heading text-base mt-0.5">{seccionSeleccionada.horario}</span>
                                </div>
                            </div>

                            {/* Contenedor de la Tabla */}
                            <div className="bg-white border border-border p-2 rounded-none shadow-xs">
                                <div className="flex items-center gap-2 mb-4  border-b border-border pb-3.5">
                                    <FileSpreadsheet className="text-primary" size={20} />
                                    <h3 className="font-heading font-extrabold text-text-heading text-base">
                                        Nómina de Estudiantes y Calificaciones
                                    </h3>
                                </div>

                                {cargandoNotas ? (
                                    <div className="flex flex-col items-center justify-center py-4 gap-3">
                                        <Loader2 className="animate-spin text-primary" size={32} />
                                        <p className="text-text-muted text-xs font-semibold">Cargando lista de estudiantes...</p>
                                    </div>
                                ) : (
                                    <TablaRegistroNotas
                                        notesList={notesList}
                                        onSaveGrade={handleSaveGrade}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
