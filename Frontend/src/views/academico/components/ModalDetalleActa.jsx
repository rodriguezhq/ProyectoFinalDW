import React from 'react';
import { Lock, AlertCircle, Loader2 } from 'lucide-react';
import Dialog from '../../../components/UI/Dialog';

export default function ModalDetalleActa({
    modalActa,
    setModalActa,
    modalLoading,
    modalError,
    ejecutarValidarActa,
    loading
}) {
    return (
        <Dialog 
            isOpen={!!modalActa} 
            onClose={() => setModalActa(null)} 
            size="4xl" 
            className="rounded-none animate-slide-up"
        >
            <Dialog.Header showCloseButton={true} className="bg-slate-50 border-b border-border">
                <div>
                    <h3 className="text-sm font-black uppercase text-text-heading tracking-wide">
                        Acta de Calificaciones: {modalActa?.curso_nombre} ({modalActa?.curso_codigo})
                    </h3>
                    <p className="text-[10px] text-text-muted mt-0.5 font-bold uppercase tracking-wider">
                        Carrera: {modalActa?.especialidad_nombre} | Sección: {modalActa?.seccion_codigo} | Ciclo: {modalActa?.ciclo}
                    </p>
                </div>
            </Dialog.Header>

            <Dialog.Content className="p-5 min-h-[300px]">
                {/* Docente a cargo */}
                <div className="mb-4 bg-slate-50 border border-border p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <span className="text-xs text-text-muted font-semibold">
                        Docente: <strong className="text-text-heading">{modalActa?.docente_nombre}</strong>
                    </span>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs font-semibold text-text-muted">Estado del Acta:</span>
                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-wider ${
                            modalActa?.estado_acta === 'cerrada' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                            {modalActa?.estado_acta === 'cerrada' ? 'Validada y Cerrada' : 'Abierta'}
                        </span>
                    </div>
                </div>

                {modalError && (
                    <div className="mb-4 p-3 bg-red-50 border-l-3 border-red-500 text-red-700 text-xs font-semibold flex items-center gap-2 rounded-none">
                        <AlertCircle size={16} />
                        <span>{modalError}</span>
                    </div>
                )}

                {/* Detalle de alumnos y notas */}
                {modalLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="animate-spin text-primary" size={28} />
                        <p className="text-xs text-text-muted font-bold">Obteniendo lista de estudiantes...</p>
                    </div>
                ) : (modalActa?.alumnos || []).length === 0 ? (
                    <p className="text-center text-xs text-text-muted italic py-10">No hay estudiantes matriculados en esta sección.</p>
                ) : (
                    <div className="w-full overflow-x-auto border border-border bg-white rounded-none">
                        <table className="w-full border-collapse text-left text-xs min-w-[700px]">
                            <thead>
                                <tr className="bg-slate-100 text-text-muted font-bold border-b border-border">
                                    <th className="p-2 border-r border-border/50 text-center w-24">Código</th>
                                    <th className="p-2 border-r border-border/50 text-left">Estudiante (Apellidos y Nombres)</th>
                                    <th className="p-2 border-r border-border/50 text-center w-20">Parcial 1</th>
                                    <th className="p-2 border-r border-border/50 text-center w-20">Parcial 2</th>
                                    <th className="p-2 border-r border-border/50 text-center w-20">Ex. Final</th>
                                    <th className="p-2 border-r border-border/50 text-center w-20">Sustitutorio</th>
                                    <th className="p-2 border-r border-border/50 text-center w-20">Promedio</th>
                                    <th className="p-2 text-center w-24">Resultado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(modalActa?.alumnos || []).map((alum, index) => {
                                    const isEven = index % 2 === 0;
                                    const finalGrade = alum.promedio;
                                    const isAprobado = finalGrade !== null && finalGrade >= 10.5;
                                    const sinNota = finalGrade === null;

                                    return (
                                        <tr key={alum.id_matricula_detalle} className={`border-b border-border/60 hover:bg-slate-50/50 ${isEven ? 'bg-white' : 'bg-slate-50/20'}`}>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-bold text-text-muted">
                                                {alum.estudiante_codigo}
                                            </td>
                                            <td className="p-2 border-r border-border/50 font-bold text-text-heading">
                                                {alum.estudiante_nombre}
                                            </td>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-bold text-slate-700">
                                                {alum.parcial1 !== null ? alum.parcial1.toFixed(1) : '-'}
                                            </td>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-bold text-slate-700">
                                                {alum.parcial2 !== null ? alum.parcial2.toFixed(1) : '-'}
                                            </td>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-bold text-slate-700">
                                                {alum.final !== null ? alum.final.toFixed(1) : '-'}
                                            </td>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-bold text-amber-600">
                                                {alum.sustitutorio !== null ? alum.sustitutorio.toFixed(1) : '-'}
                                            </td>
                                            <td className="p-2 border-r border-border/50 text-center font-mono font-black text-sm text-primary">
                                                {finalGrade !== null ? finalGrade.toFixed(2) : '-'}
                                            </td>
                                            <td className="p-2 text-center">
                                                {sinNota ? (
                                                    <span className="text-[10px] text-text-muted font-bold italic font-sans">Sin Nota</span>
                                                ) : (
                                                    <span className={`px-2 py-0.5 font-extrabold uppercase text-[9px] ${
                                                        isAprobado 
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                                            : 'bg-red-50 text-red-600 border border-red-200'
                                                    }`}>
                                                        {isAprobado ? 'Aprobado' : 'Desaprobado'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Dialog.Content>

            <Dialog.Footer className="bg-slate-50">
                <button
                    type="button"
                    onClick={() => setModalActa(null)}
                    className="py-2 px-4 bg-white border border-border text-text-heading hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer transition-colors"
                >
                    Cerrar
                </button>
                {modalActa?.estado_acta === 'abierta' && (modalActa?.alumnos || []).length > 0 && (
                    <button
                        type="button"
                        onClick={() => ejecutarValidarActa(modalActa.id_seccion, modalActa.id_curso)}
                        disabled={loading || modalLoading}
                        className="flex items-center gap-1.5 py-2 px-4 bg-primary text-white border-none hover:bg-primary-dark font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Lock size={14} />
                        Validar y Cerrar Acta
                    </button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
}
