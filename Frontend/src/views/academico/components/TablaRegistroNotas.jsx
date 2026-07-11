import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TablaRegistroNotas({ notesList, onSaveGrade }) {
    // Estado local para almacenar las notas editadas de cada estudiante
    const [localGrades, setLocalGrades] = useState({});
    const [savingIds, setSavingIds] = useState({});

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

    const handleSave = async (idDetalle) => {
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
        <div className="w-full flex flex-col gap-1.5">
            <span className="text-xs text-text-muted font-semibold self-end">
                * Las notas son sobre un sistema vigesimal (0 - 20).
            </span>
            
            {/* Contenedor de la tabla responsiva y con scroll vertical aislado */}
            <div className="w-full overflow-x-auto border border-border rounded-xl shadow-sm">
                <div 
                    className="overflow-y-auto max-h-[480px] min-w-[900px]" 
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(13,82,44,0.2) transparent' }}
                >
                    <table className="w-full text-left border-collapse text-[0.88rem]">
                        {/* Cabecera pegajosa (Sticky) */}
                        <thead className="bg-bg-alt text-text-heading font-extrabold sticky top-0 z-10 border-b border-border shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                            <tr>
                                <th className="p-4 bg-bg-alt">Código</th>
                                <th className="p-4 bg-bg-alt">Estudiante</th>
                                <th className="p-4 text-center bg-bg-alt w-[90px]">Parcial 1</th>
                                <th className="p-4 text-center bg-bg-alt w-[90px]">Parcial 2</th>
                                <th className="p-4 text-center bg-bg-alt w-[90px]">Ex. Final</th>
                                <th className="p-4 text-center bg-bg-alt w-[90px]">Ex. Sust.</th>
                                <th className="p-4 text-center bg-bg-alt w-[90px]">Promedio</th>
                                <th className="p-4 text-center bg-bg-alt w-[110px]">Estado</th>
                                <th className="p-4 text-center bg-bg-alt w-[100px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-white">
                            {notesList.map((item) => {
                                const idDetalle = item.id_matricula_detalle;
                                const currentLocal = localGrades[idDetalle] || { parcial1: '', parcial2: '', final: '', sustitutorio: '' };
                                const isSaving = savingIds[idDetalle] || false;
                                
                                // Color del promedio: Verde si es aprobada (>= 10.5), rojo si es desaprobada, gris si está vacía
                                const esAprobado = item.promedio !== null && item.promedio >= 10.5;
                                const colorPromedio = item.promedio === null 
                                    ? 'text-text-muted' 
                                    : (esAprobado ? 'text-emerald-600 font-extrabold' : 'text-red-600 font-extrabold');

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
                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
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
                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
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
                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
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
                                                className="w-16 mx-auto text-center py-1.5 border border-border rounded bg-bg-input text-text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[0.88rem]"
                                                value={currentLocal.sustitutorio}
                                                placeholder="-"
                                                onChange={(e) => handleInputChange(idDetalle, 'sustitutorio', e.target.value)}
                                                disabled={isSaving}
                                            />
                                        </td>
                                        
                                        {/* Promedio */}
                                        <td className={`p-4 text-center font-mono ${colorPromedio}`}>
                                            {item.promedio !== null ? item.promedio.toFixed(2) : '-'}
                                        </td>
                                        
                                        {/* Estado */}
                                        <td className="p-4 text-center">
                                            {renderEstadoBadge(item.estado)}
                                        </td>
                                        
                                        {/* Acciones */}
                                        <td className="p-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleSave(idDetalle)}
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
        </div>
    );
}
