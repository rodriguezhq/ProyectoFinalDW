import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TablaRegistroNotas({ notesList, onSaveGrade }) {
    // Estado local para almacenar las notas editadas de cada estudiante
    const [localGrades, setLocalGrades] = useState({});
    const [savingIds, setSavingIds] = useState({});
    const [confirmModal, setConfirmModal] = useState(null);

    // Sincronizar el estado local cuando cambia la lista recibida por props
    useEffect(() => {
        const initialGrades = {};
        notesList.forEach(n => {
            initialGrades[n.id_matricula_detalle] = {
                parcial1: n.parcial1 !== null ? n.parcial1.toString() : '',
                parcial2: n.parcial2 !== null ? n.parcial2.toString() : '',
                final: n.final !== null ? n.final.toString() : '',
                sustitutorio: n.sustitutorio !== null ? n.sustitutorio.toString() : ''
            };
        });
        setLocalGrades(initialGrades);
    }, [notesList]);

    const calcularPromedioLocal = (grades) => {
        if (!grades) return null;
        const p1 = grades.parcial1 !== '' ? parseFloat(grades.parcial1) : null;
        const p2 = grades.parcial2 !== '' ? parseFloat(grades.parcial2) : null;
        const fin = grades.final !== '' ? parseFloat(grades.final) : null;
        const sust = grades.sustitutorio !== '' ? parseFloat(grades.sustitutorio) : null;

        // Si falta alguna nota principal, no se calcula promedio
        if (p1 === null || p2 === null || fin === null || isNaN(p1) || isNaN(p2) || isNaN(fin)) {
            return null;
        }

        let notas = [p1, p2, fin];
        if (sust !== null && !isNaN(sust)) {
            // Reemplaza la nota más baja si el sustitutorio es mayor
            const minNota = Math.min(...notas);
            const idxMin = notas.indexOf(minNota);
            if (sust > minNota) {
                notas[idxMin] = sust;
            }
        }

        const promedio = notas.reduce((acc, val) => acc + val, 0) / 3;
        return parseFloat(promedio.toFixed(2));
    };

    const handleInputChange = (idDetalle, campo, valor) => {
        // Filtrar para permitir solo números enteros o decimales en formato básico (ej: "15" o "15.5")
        // No permitir letras ni caracteres especiales excepto punto decimal
        const valorLimpio = valor.replace(/[^0-9.]/g, '');

        // Validar que no haya más de un punto decimal
        const partes = valorLimpio.split('.');
        if (partes.length > 2) return;

        // Validar que el valor numérico no supere 20
        if (valorLimpio !== '' && parseFloat(valorLimpio) > 20) {
            return;
        }

        setLocalGrades(prev => ({
            ...prev,
            [idDetalle]: {
                ...prev[idDetalle],
                [campo]: valorLimpio
            }
        }));
    };

    const handleSaveClick = (idDetalle, studentName, studentCodigo) => {
        const grades = localGrades[idDetalle];
        if (!grades) return;

        // Validar que las notas no vacías estén en el rango de 0 a 20
        const validateGrade = (val) => {
            if (val === '') return true;
            const num = parseFloat(val);
            return !isNaN(num) && num >= 0 && num <= 20;
        };

        if (!validateGrade(grades.parcial1) || !validateGrade(grades.parcial2) ||
            !validateGrade(grades.final) || !validateGrade(grades.sustitutorio)) {
            alert("Todas las notas ingresadas deben ser números entre 0 y 20.");
            return;
        }

        const promedio = calcularPromedioLocal(grades);
        const estado = promedio !== null ? (promedio >= 10.5 ? 'aprobada' : 'desaprobada') : 'sin_nota';

        setConfirmModal({
            idDetalle,
            studentName,
            studentCodigo,
            grades,
            promedio,
            estado
        });
    };

    const handleConfirmSave = async () => {
        if (!confirmModal) return;
        const { idDetalle, grades } = confirmModal;
        setConfirmModal(null);
        try {
            setSavingIds(prev => ({ ...prev, [idDetalle]: true }));
            await onSaveGrade(idDetalle, grades);
        } finally {
            setSavingIds(prev => ({ ...prev, [idDetalle]: false }));
        }
    };

    const renderEstadoBadge = (estado) => {
        switch (estado) {
            case 'aprobada':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Aprobado
                    </span>
                );
            case 'desaprobada':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        Desaprobado
                    </span>
                );
            case 'registrada':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Registrada
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-text-muted border border-border">
                        Sin Notas
                    </span>
                );
        }
    };

    if (notesList.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-bg-alt border border-border rounded-xl text-center">
                <AlertCircle className="text-text-muted mb-2.5" size={32} />
                <p className="text-sm font-semibold text-text-heading">No se encontraron estudiantes matriculados</p>
                <p className="text-xs text-text-muted mt-1">Selecciona otra asignatura o sección del listado.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col ">
            <span className="text-xs text-text-muted font-semibold self-end">
                * Las notas son sobre un sistema vigesimal (0 - 20).
            </span>

            {/* Contenedor de la tabla responsiva y con scroll vertical aislado */}
            <div className="w-full overflow-x-auto border border-border rounded-none shadow-sm">
                <div
                    className="overflow-y-auto max-h-[480px] min-w-[900px]"
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(13,82,44,0.2) transparent' }}
                >
                    <table className="w-full text-left border-collapse text-[0.88rem]">
                        {/* Cabecera pegajosa (Sticky) */}
                        <thead className="bg-bg-alt text-text-heading font-extrabold sticky top-0 z-10 border-b border-border shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                            <tr>
                                <th className="p-2 bg-bg-alt">Código</th>
                                <th className="p-2 bg-bg-alt">Estudiante</th>
                                <th className="p-2 text-center bg-bg-alt w-[80px]">Parcial 1</th>
                                <th className="p-2 text-center bg-bg-alt w-[80px]">Parcial 2</th>
                                <th className="p-2 text-center bg-bg-alt w-[80px]">Ex. Final</th>
                                <th className="p-2 text-center bg-bg-alt w-[80px]">Ex. Sust.</th>
                                <th className="p-2 text-center bg-bg-alt w-[80px]">Promedio</th>
                                <th className="p-2 text-center bg-bg-alt w-[110px]">Estado</th>
                                <th className="p-2 text-center bg-bg-alt w-[100px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            {notesList.map((item) => {
                                const idDetalle = item.id_matricula_detalle;
                                const currentLocal = localGrades[idDetalle] || { parcial1: '', parcial2: '', final: '', sustitutorio: '' };
                                const isSaving = savingIds[idDetalle] || false;

                                const promedioLocal = calcularPromedioLocal(currentLocal);
                                const displayPromedio = promedioLocal !== null ? promedioLocal : item.promedio;
                                const esAprobado = displayPromedio !== null && displayPromedio >= 10.5;
                                const colorPromedio = displayPromedio === null
                                    ? 'text-text-muted'
                                    : (esAprobado ? 'text-emerald-600 font-extrabold' : 'text-red-600 font-extrabold');
                                const estadoLocal = promedioLocal !== null ? (promedioLocal >= 10.5 ? 'aprobada' : 'desaprobada') : item.estado;

                                return (
                                    <tr key={idDetalle} className="hover:bg-bg-alt/45 transition-colors">
                                        <td className="p-4 font-mono text-xs font-semibold text-text-muted">
                                            {item.estudiante_codigo}
                                        </td>
                                        <td className="p-4 font-bold text-text-heading">
                                            {item.estudiante_nombre}
                                        </td>

                                        {/* Input Parcial 1 */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="w-14 mx-auto text-center  border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                value={currentLocal.parcial1}
                                                placeholder="-"
                                                onChange={(e) => handleInputChange(idDetalle, 'parcial1', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </td>

                                        {/* Input Parcial 2 */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="w-14 mx-auto text-center  border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                value={currentLocal.parcial2}
                                                placeholder="-"
                                                onChange={(e) => handleInputChange(idDetalle, 'parcial2', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </td>

                                        {/* Input Final */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="w-14 mx-auto text-center  border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                value={currentLocal.final}
                                                placeholder="-"
                                                onChange={(e) => handleInputChange(idDetalle, 'final', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </td>

                                        {/* Input Sustitutorio */}
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                className="w-14 mx-auto text-center  border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                value={currentLocal.sustitutorio}
                                                placeholder="-"
                                                onChange={(e) => handleInputChange(idDetalle, 'sustitutorio', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </td>

                                        {/* Promedio */}
                                        <td className={`p-4 text-center font-mono ${colorPromedio}`}>
                                            {displayPromedio !== null ? displayPromedio.toFixed(2) : '-'}
                                        </td>

                                        {/* Estado */}
                                        <td className="p-4 text-center">
                                            {renderEstadoBadge(estadoLocal)}
                                        </td>

                                        {/* Acciones */}
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleSaveClick(idDetalle, item.estudiante_nombre, item.estudiante_codigo)}
                                                disabled={isSaving}
                                                className="bg-primary text-white p-2 rounded-lg hover:bg-primary-hover shadow-sm transition-all disabled:opacity-50 inline-flex items-center justify-center cursor-pointer"
                                                title="Guardar notas del estudiante"
                                            >
                                                {isSaving ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Save size={16} />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Confirmación */}
            {confirmModal && (
                <div 
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-fade-in"
                    onClick={() => setConfirmModal(null)}
                >
                    <div 
                        className="bg-white rounded-none border-2 border-border shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cabecera */}
                        <div className="bg-slate-50 border-b border-border p-4 flex justify-between items-center rounded-none">
                            <h3 className="font-heading font-black text-xs uppercase tracking-wider text-text-heading">
                                Confirmar Registro de Notas
                            </h3>
                            <button 
                                type="button" 
                                onClick={() => setConfirmModal(null)}
                                className="text-text-muted hover:text-text-heading transition-colors cursor-pointer text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Contenido */}
                        <div className="p-5 space-y-4">
                            <div className="bg-slate-50 border border-border p-3 rounded-none">
                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Estudiante</p>
                                <p className="font-bold text-text-heading text-sm mt-0.5">{confirmModal.studentName}</p>
                                <p className="font-mono text-xs text-text-muted mt-0.5">Código: {confirmModal.studentCodigo}</p>
                            </div>

                            <div>
                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mb-2">Detalle de Calificaciones</p>
                                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                    <div className="bg-bg-alt border border-border p-2 rounded-none">
                                        <span className="block font-semibold text-text-muted text-[10px] uppercase">P1</span>
                                        <span className="block font-bold text-text-heading mt-1">{confirmModal.grades.parcial1 || '-'}</span>
                                    </div>
                                    <div className="bg-bg-alt border border-border p-2 rounded-none">
                                        <span className="block font-semibold text-text-muted text-[10px] uppercase">P2</span>
                                        <span className="block font-bold text-text-heading mt-1">{confirmModal.grades.parcial2 || '-'}</span>
                                    </div>
                                    <div className="bg-bg-alt border border-border p-2 rounded-none">
                                        <span className="block font-semibold text-text-muted text-[10px] uppercase">EF</span>
                                        <span className="block font-bold text-text-heading mt-1">{confirmModal.grades.final || '-'}</span>
                                    </div>
                                    <div className="bg-bg-alt border border-border p-2 rounded-none">
                                        <span className="block font-semibold text-text-muted text-[10px] uppercase">ES</span>
                                        <span className="block font-bold text-text-heading mt-1">{confirmModal.grades.sustitutorio || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-3 flex justify-between items-center">
                                <div>
                                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider">Promedio Estimado</span>
                                    <span className={`text-lg font-mono font-black ${
                                        confirmModal.promedio === null 
                                            ? 'text-text-muted' 
                                            : (confirmModal.promedio >= 10.5 ? 'text-emerald-600' : 'text-red-600')
                                    }`}>
                                        {confirmModal.promedio !== null ? confirmModal.promedio.toFixed(2) : '-'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-text-muted uppercase font-bold tracking-wider text-right mb-1">Estado Estimado</span>
                                    {renderEstadoBadge(confirmModal.estado)}
                                </div>
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="bg-slate-50 border-t border-border p-4 flex justify-end gap-3 rounded-none">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(null)}
                                className="py-1.5 px-3 bg-white border border-border hover:bg-slate-100 text-text-heading font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSave}
                                className="py-1.5 px-4 bg-primary text-white hover:bg-primary-hover font-bold text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer flex items-center gap-1.5"
                            >
                                Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
