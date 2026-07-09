import React, { useState, useEffect } from 'react';
import GradeService from '../../Services/GradeService';
import { Save, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocenteNotas() {
    const [secciones, setSecciones] = useState([]);
    const [selectedSeccionId, setSelectedSeccionId] = useState('');
    const [alumnosNotas, setAlumnosNotas] = useState([]);
    const [loadingSecciones, setLoadingSecciones] = useState(true);
    const [loadingNotas, setLoadingNotas] = useState(false);
    const [savingAll, setSavingAll] = useState(false);
    
    // Feedback states
    const [feedback, setFeedback] = useState(null); // { message, type }

    // On mount, load sections taught by this teacher
    useEffect(() => {
        const fetchSecciones = async () => {
            try {
                setLoadingSecciones(true);
                const data = await GradeService.getMisSecciones();
                const list = data.secciones || [];
                setSecciones(list);
                if (list.length > 0) {
                    setSelectedSeccionId(list[0].id_seccion.toString());
                }
            } catch (err) {
                showFeedback(err.message || 'Error al cargar las secciones.', 'error');
            } finally {
                setLoadingSecciones(false);
            }
        };
        fetchSecciones();
    }, []);

    // Load grades when selection changes
    useEffect(() => {
        if (!selectedSeccionId) {
            setAlumnosNotas([]);
            return;
        }
        fetchNotasDeSeccion(selectedSeccionId);
    }, [selectedSeccionId]);

    const fetchNotasDeSeccion = async (seccionId) => {
        try {
            setLoadingNotas(true);
            setFeedback(null);
            const data = await GradeService.getNotasSeccion(seccionId);
            const list = (data.notas || []).map(item => ({
                ...item,
                parcial1: item.parcial1 !== null ? item.parcial1 : '',
                parcial2: item.parcial2 !== null ? item.parcial2 : '',
                final: item.final !== null ? item.final : '',
                sustitutorio: item.sustitutorio !== null ? item.sustitutorio : '',
                isModified: false,
                isSaving: false,
                errors: {
                    parcial1: false,
                    parcial2: false,
                    final: false,
                    sustitutorio: false
                }
            }));
            setAlumnosNotas(list);
        } catch (err) {
            showFeedback(err.message || 'Error al cargar las notas.', 'error');
        } finally {
            setLoadingNotas(false);
        }
    };

    const showFeedback = (message, type = 'success') => {
        setFeedback({ message, type });
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            setFeedback(prev => {
                if (prev && prev.message === message) return null;
                return prev;
            });
        }, 5000);
    };

    // JS local average calculation matching the backend ROUND_HALF_UP logic
    const calcularPromedioLocal = (p1, p2, pf, sust) => {
        const checkVal = (v) => (v === null || v === undefined || v === '' || isNaN(v));
        if (checkVal(p1) || checkVal(p2) || checkVal(pf)) {
            return null;
        }
        
        let grades = [parseFloat(p1), parseFloat(p2), parseFloat(pf)];
        if (!checkVal(sust)) {
            let valSust = parseFloat(sust);
            let minGrade = Math.min(...grades);
            if (valSust > minGrade) {
                let minIndex = grades.indexOf(minGrade);
                grades[minIndex] = valSust;
            }
        }
        
        let sum = grades.reduce((acc, curr) => acc + curr, 0);
        return Math.round((sum / 3 + Number.EPSILON) * 100) / 100;
    };

    const handleGradeChange = (idMatriculaDetalle, field, val) => {
        setAlumnosNotas(prev => prev.map(row => {
            if (row.id_matricula_detalle === idMatriculaDetalle) {
                let isInvalid = false;
                if (val !== '') {
                    const num = parseFloat(val);
                    if (isNaN(num) || num < 0 || num > 20) {
                        isInvalid = true;
                    }
                }
                
                const updatedRow = {
                    ...row,
                    [field]: val,
                    isModified: true,
                    errors: {
                        ...row.errors,
                        [field]: isInvalid
                    }
                };
                
                const hasErrors = Object.values(updatedRow.errors).some(e => e === true);
                
                if (!hasErrors) {
                    const p1 = updatedRow.parcial1;
                    const p2 = updatedRow.parcial2;
                    const pf = updatedRow.final;
                    const sust = updatedRow.sustitutorio;
                    
                    const avg = calcularPromedioLocal(p1, p2, pf, sust);
                    updatedRow.promedio = avg;
                    if (avg !== null) {
                        updatedRow.estado = avg >= 10.5 ? 'aprobada' : 'desaprobada';
                    } else {
                        updatedRow.estado = 'sin_nota';
                    }
                } else {
                    updatedRow.promedio = null;
                    updatedRow.estado = 'error';
                }
                
                return updatedRow;
            }
            return row;
        }));
    };

    // Save individual student row
    const saveRow = async (row) => {
        const hasErrors = Object.values(row.errors).some(e => e === true);
        if (hasErrors) {
            showFeedback('Corrija las notas con valores inválidos (deben ser entre 0 y 20).', 'error');
            return;
        }

        setAlumnosNotas(prev => prev.map(r => r.id_matricula_detalle === row.id_matricula_detalle ? { ...r, isSaving: true } : r));

        try {
            const body = {
                parcial1: row.parcial1 === '' ? null : parseFloat(row.parcial1),
                parcial2: row.parcial2 === '' ? null : parseFloat(row.parcial2),
                final: row.final === '' ? null : parseFloat(row.final),
                sustitutorio: row.sustitutorio === '' ? null : parseFloat(row.sustitutorio)
            };

            await GradeService.saveNotaIndividual(row.id_matricula_detalle, body);
            
            setAlumnosNotas(prev => prev.map(r => {
                if (r.id_matricula_detalle === row.id_matricula_detalle) {
                    return { ...r, isModified: false, isSaving: false };
                }
                return r;
            }));
            showFeedback(`Notas de ${row.estudiante_nombre} guardadas correctamente.`, 'success');
        } catch (err) {
            showFeedback(err.message || 'Error al guardar notas individuales.', 'error');
            setAlumnosNotas(prev => prev.map(r => r.id_matricula_detalle === row.id_matricula_detalle ? { ...r, isSaving: false } : r));
        }
    };

    // Save all modified rows in bulk
    const saveAllModified = async () => {
        const modifiedRows = alumnosNotas.filter(r => r.isModified);
        if (modifiedRows.length === 0) {
            showFeedback('No hay cambios pendientes por guardar.', 'success');
            return;
        }

        // Check if there are errors
        const hasErrors = modifiedRows.some(row => Object.values(row.errors).some(e => e === true));
        if (hasErrors) {
            showFeedback('Corrija las notas con errores antes de guardar.', 'error');
            return;
        }

        try {
            setSavingAll(true);
            setFeedback(null);
            
            const notasToSend = modifiedRows.map(row => ({
                id_matricula_detalle: row.id_matricula_detalle,
                parcial1: row.parcial1 === '' ? null : parseFloat(row.parcial1),
                parcial2: row.parcial2 === '' ? null : parseFloat(row.parcial2),
                final: row.final === '' ? null : parseFloat(row.final),
                sustitutorio: row.sustitutorio === '' ? null : parseFloat(row.sustitutorio)
            }));

            await GradeService.saveNotasBulk(notasToSend);
            
            // Fetch updated grades to ensure sync with calculated data on backend
            await fetchNotasDeSeccion(selectedSeccionId);
            showFeedback('Todas las notas han sido guardadas y actualizadas exitosamente.', 'success');
        } catch (err) {
            showFeedback(err.message || 'Error al guardar las notas en lote.', 'error');
        } finally {
            setSavingAll(false);
        }
    };

    const hasGlobalModified = alumnosNotas.some(r => r.isModified);
    const hasGlobalErrors = alumnosNotas.some(row => Object.values(row.errors).some(e => e === true));

    if (loadingSecciones) {
        return (
            <div className="w-full h-full flex items-center justify-center p-6 text-sm text-text-muted">
                Cargando secciones...
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Header simple */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-3 gap-2">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-text-heading">Registro de Notas</h1>
                    <p className="text-xs text-text-muted mt-0.5">Asigne y modifique calificaciones de alumnos de su sección.</p>
                </div>
                
                {/* Control bar */}
                <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor="seccion-select" className="text-xs font-bold uppercase tracking-wider text-text-muted">Sección:</label>
                    <select
                        id="seccion-select"
                        value={selectedSeccionId}
                        onChange={(e) => setSelectedSeccionId(e.target.value)}
                        className="bg-white border border-border text-sm p-1.5 outline-none focus:border-primary shrink-0 min-w-[200px]"
                        disabled={loadingNotas || savingAll}
                    >
                        {secciones.length === 0 ? (
                            <option value="">No hay secciones asignadas</option>
                        ) : (
                            secciones.map(sec => (
                                <option key={sec.id_seccion} value={sec.id_seccion}>
                                    {sec.seccion_codigo} - {sec.curso_nombre}
                                </option>
                            ))
                        )}
                    </select>

                    <button
                        onClick={() => selectedSeccionId && fetchNotasDeSeccion(selectedSeccionId)}
                        title="Recargar Notas"
                        className="p-2 bg-slate-100 hover:bg-slate-200 border border-border text-text-main focus:outline-none disabled:opacity-50"
                        disabled={loadingNotas || savingAll || !selectedSeccionId}
                    >
                        <RefreshCw size={14} className={loadingNotas ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={saveAllModified}
                        disabled={!hasGlobalModified || hasGlobalErrors || savingAll || loadingNotas}
                        className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold uppercase tracking-wider py-2 px-4 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed select-none border-none"
                    >
                        <Save size={14} />
                        {savingAll ? 'Guardando...' : 'Guardar Todo'}
                    </button>
                </div>
            </div>

            {/* Banner de retroalimentación plano */}
            {feedback && (
                <div className={`p-2.5 text-xs font-medium border flex items-start gap-2 ${
                    feedback.type === 'error' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                    {feedback.type === 'error' ? (
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    ) : (
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Listado de Alumnos */}
            {!selectedSeccionId ? (
                <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                    No tiene secciones seleccionadas o disponibles.
                </div>
            ) : loadingNotas ? (
                <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                    Cargando notas de estudiantes...
                </div>
            ) : alumnosNotas.length === 0 ? (
                <div className="w-full bg-slate-50 border border-border p-6 text-center text-sm text-text-muted">
                    No hay estudiantes matriculados en esta sección.
                </div>
            ) : (
                <div className="w-full overflow-x-auto border border-border bg-white">
                    <table className="w-full border-collapse text-left text-xs text-text-main">
                        <thead>
                            <tr className="bg-primary-light text-primary font-bold uppercase tracking-wider border-b border-border">
                                <th className="p-2 border-r border-border/60 text-center w-24">Código</th>
                                <th className="p-2 border-r border-border/60 text-left min-w-[200px]">Estudiante</th>
                                <th className="p-2 border-r border-border/60 text-center w-20">Parcial 1</th>
                                <th className="p-2 border-r border-border/60 text-center w-20">Parcial 2</th>
                                <th className="p-2 border-r border-border/60 text-center w-20">Final</th>
                                <th className="p-2 border-r border-border/60 text-center w-20">Susti</th>
                                <th className="p-2 border-r border-border/60 text-center w-24">Promedio</th>
                                <th className="p-2 border-r border-border/60 text-center w-28">Estado</th>
                                <th className="p-2 text-center w-24">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosNotas.map((row, idx) => {
                                const hasRowErrors = Object.values(row.errors).some(e => e === true);
                                return (
                                    <tr 
                                        key={row.id_matricula_detalle} 
                                        className={`border-b border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-bg-alt/25'} ${row.isModified ? 'bg-amber-50/30' : ''}`}
                                    >
                                        {/* Código */}
                                        <td className="p-2 border-r border-border/60 text-center font-mono font-medium text-text-heading">
                                            {row.estudiante_codigo}
                                        </td>
                                        
                                        {/* Estudiante */}
                                        <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                                            {row.estudiante_nombre}
                                        </td>

                                        {/* Parcial 1 */}
                                        <td className="p-2 border-r border-border/60 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.1"
                                                value={row.parcial1}
                                                onChange={(e) => handleGradeChange(row.id_matricula_detalle, 'parcial1', e.target.value)}
                                                disabled={row.isSaving || savingAll}
                                                className={`w-14 text-center border p-1 text-xs bg-white focus:outline-none ${
                                                    row.errors.parcial1 ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-border focus:border-primary'
                                                }`}
                                            />
                                        </td>

                                        {/* Parcial 2 */}
                                        <td className="p-2 border-r border-border/60 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.1"
                                                value={row.parcial2}
                                                onChange={(e) => handleGradeChange(row.id_matricula_detalle, 'parcial2', e.target.value)}
                                                disabled={row.isSaving || savingAll}
                                                className={`w-14 text-center border p-1 text-xs bg-white focus:outline-none ${
                                                    row.errors.parcial2 ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-border focus:border-primary'
                                                }`}
                                            />
                                        </td>

                                        {/* Final */}
                                        <td className="p-2 border-r border-border/60 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.1"
                                                value={row.final}
                                                onChange={(e) => handleGradeChange(row.id_matricula_detalle, 'final', e.target.value)}
                                                disabled={row.isSaving || savingAll}
                                                className={`w-14 text-center border p-1 text-xs bg-white focus:outline-none ${
                                                    row.errors.final ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-border focus:border-primary'
                                                }`}
                                            />
                                        </td>

                                        {/* Sustitutorio */}
                                        <td className="p-2 border-r border-border/60 text-center">
                                            <input
                                                type="number"
                                                min="0"
                                                max="20"
                                                step="0.1"
                                                value={row.sustitutorio}
                                                onChange={(e) => handleGradeChange(row.id_matricula_detalle, 'sustitutorio', e.target.value)}
                                                disabled={row.isSaving || savingAll}
                                                className={`w-14 text-center border p-1 text-xs bg-white focus:outline-none ${
                                                    row.errors.sustitutorio ? 'border-red-500 bg-red-50 focus:border-red-500' : 'border-border focus:border-primary'
                                                }`}
                                            />
                                        </td>

                                        {/* Promedio */}
                                        <td className="p-2 border-r border-border/60 text-center font-bold text-text-heading">
                                            {row.promedio !== null ? row.promedio.toFixed(2) : '-'}
                                        </td>

                                        {/* Estado */}
                                        <td className="p-2 border-r border-border/60 text-center font-bold">
                                            {row.estado === 'aprobada' && (
                                                <span className="text-green-700">Aprobado</span>
                                            )}
                                            {row.estado === 'desaprobada' && (
                                                <span className="text-red-700">Desaprobado</span>
                                            )}
                                            {row.estado === 'sin_nota' && (
                                                <span className="text-text-muted font-normal">Sin Nota</span>
                                            )}
                                            {row.estado === 'error' && (
                                                <span className="text-red-500 font-normal">Error en notas</span>
                                            )}
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => saveRow(row)}
                                                disabled={!row.isModified || hasRowErrors || row.isSaving || savingAll}
                                                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed select-none"
                                            >
                                                {row.isSaving ? 'Guardando' : 'Guardar'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}