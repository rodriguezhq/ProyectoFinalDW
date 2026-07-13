import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Loader2, 
    ArrowLeft, 
    CheckCircle2, 
    AlertTriangle, 
    CreditCard, 
    BookOpen, 
    CalendarDays, 
    Check, 
    X,
    Coins,
    User,
    Download
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    obtenerMatriculaAdmin, 
    confirmarMatriculaAdmin 
} from '../../services/servicioMatriculaAdmin';
import { consultarApi } from '../../services/clienteApi';

const DIAS_SEMANA = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
const HORAS_DIA = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 a 22:00

export default function DetalleMatriculaAdmin() {
    const { id_matricula } = useParams();
    const navigate = useNavigate();
    const [cargando, setCargando] = useState(true);
    const [matricula, setMatricula] = useState(null);
    const [procesando, setProcesando] = useState(false);
    
    // Modal de Pago
    const [mostrarModalPago, setMostrarModalPago] = useState(false);
    const [montoPago, setMontoPago] = useState('120.00');
    const [metodoPago, setMetodoPago] = useState('transferencia');
    const [codigoOperacion, setCodigoOperacion] = useState('');
    
    // Información del pago registrado localmente para guardar al confirmar
    const [pagoRegistrado, setPagoRegistrado] = useState(null);

    const cargarDetalle = async () => {
        try {
            setCargando(true);
            const datos = await obtenerMatriculaAdmin(id_matricula);
            setMatricula(datos);
            if (datos.pago) {
                setPagoRegistrado({
                    monto: datos.pago.monto,
                    metodo_pago: datos.pago.metodo_pago,
                    codigo_operacion: datos.pago.codigo_operacion,
                    confirmado_previo: true
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar detalle de matrícula.');
            navigate('/admin/validar-matriculas');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDetalle();
    }, [id_matricula]);

    // Lógica del Calendario de Horarios Semanal
    const obtenerBloqueEnCelda = (dia, hora) => {
        if (!matricula || !matricula.cursos) return null;
        
        // Colores distintivos asignados a las filas
        const coloresMap = [
            'bg-blue-50 border-blue-200 text-blue-800',
            'bg-emerald-50 border-emerald-200 text-emerald-800',
            'bg-indigo-50 border-indigo-200 text-indigo-800',
            'bg-purple-50 border-purple-200 text-purple-800',
            'bg-amber-50 border-amber-200 text-amber-800',
            'bg-rose-50 border-rose-200 text-rose-800',
            'bg-teal-50 border-teal-200 text-teal-800'
        ];

        for (let i = 0; i < matricula.cursos.length; i++) {
            const curso = matricula.cursos[i];
            const color = coloresMap[i % coloresMap.length];
            
            for (const b of (curso.horarios || [])) {
                if (b.dia.toUpperCase() === dia.toUpperCase()) {
                    const [hIni] = b.horaInicio.split(':').map(Number);
                    const [hFin] = b.horaFin.split(':').map(Number);
                    if (hora >= hIni && hora < hFin) {
                        return {
                            cursoNombre: curso.nombre,
                            seccionCodigo: curso.seccion_codigo,
                            colorClass: color,
                            inicio: hIni
                        };
                    }
                }
            }
        }
        return null;
    };

    const guardarDatosPagoModal = (e) => {
        e.preventDefault();
        if (!montoPago || Number(montoPago) <= 0) {
            toast.error('Por favor, ingresa un monto de pago válido.');
            return;
        }
        
        setPagoRegistrado({
            monto: Number(montoPago),
            metodo_pago: metodoPago,
            codigo_operacion: codigoOperacion,
            confirmado_previo: false
        });
        
        setMostrarModalPago(false);
        toast.success('Información de pago registrada localmente.');
    };

    const quitarPagoLocal = () => {
        setPagoRegistrado(null);
        setCodigoOperacion('');
        toast.info('Se removió la información del pago.');
    };

    const manejarConfirmacionMatricula = async () => {
        try {
            setProcesando(true);
            const payload = {
                registrar_pago: !!pagoRegistrado && !pagoRegistrado.confirmado_previo,
                monto: pagoRegistrado ? pagoRegistrado.monto : null,
                metodo_pago: pagoRegistrado ? pagoRegistrado.metodo_pago : null,
                codigo_operacion: pagoRegistrado ? pagoRegistrado.codigo_operacion : null
            };

            await confirmarMatriculaAdmin(id_matricula, payload);
            toast.success('¡Matrícula confirmada y procesada exitosamente!');
            navigate('/admin/validar-matriculas');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al confirmar la matrícula.');
        } finally {
            setProcesando(false);
        }
    };

    const manejarRechazoMatricula = async () => {
        if (!window.confirm('¿Está seguro de que desea RECHAZAR la solicitud de matrícula de este estudiante?')) {
            return;
        }
        try {
            setProcesando(true);
            const respuesta = await consultarApi(`/api/enrollment/${id_matricula}/rechazar`, { method: 'POST' });
            if (!respuesta.ok) {
                const errorDatos = await respuesta.json();
                throw new Error(errorDatos.msg || 'Error al rechazar la matrícula.');
            }
            toast.success('La matrícula ha sido rechazada.');
            navigate('/admin/validar-matriculas');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Error al rechazar matrícula.');
        } finally {
            setProcesando(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
                <Loader2 className="animate-spin text-primary" size={42} />
                <p className="text-text-muted text-sm font-semibold">Cargando detalles de la solicitud de matrícula...</p>
            </div>
        );
    }

    if (!matricula) return null;

    return (
        <div className="max-w-6xl mx-auto flex flex-col gap-6 animate-fade-in pb-12">
            
            {/* Botón de Retorno */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/validar-matriculas')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} />
                    Regresar al Listado de Matrículas
                </button>
            </div>

            {/* Ficha Resumen Estudiante */}
            <div className="bg-white border border-border p-5 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-primary/5 text-primary rounded-xl shrink-0">
                        <User size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.62rem] font-bold text-text-light uppercase tracking-wider">Estudiante Solicitante</span>
                        <h4 className="font-heading font-bold text-text-heading text-lg leading-tight mt-0.5">
                            {matricula.estudiante_nombres} {matricula.estudiante_apellidos}
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted font-semibold mt-1.5">
                            <span>Código: <b className="text-text-heading">{matricula.estudiante_codigo}</b></span>
                            <span>DNI: <b className="text-text-heading">{matricula.estudiante_dni}</b></span>
                            <span>Carrera: <b className="text-text-heading">{matricula.estudiante_especialidad}</b></span>
                            <span>Ciclo: <b className="text-text-heading">{matricula.estudiante_ciclo}° Ciclo</b></span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[0.62rem] font-bold text-text-light uppercase">Estado Solicitud</span>
                    <span className={`px-3 py-1 border text-xs font-bold uppercase rounded-full ${
                        matricula.estado === 'pendiente' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        matricula.estado === 'confirmada' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                        {matricula.estado}
                    </span>
                    {matricula.estado === 'confirmada' && (
                        <a
                            href={`${import.meta.env.VITE_API_BASE_URL || ''}/api/enrollment/matricula/${id_matricula}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white font-bold text-[0.72rem] shadow-xs hover:bg-primary-dark transition-all duration-200 cursor-pointer mt-2"
                        >
                            <Download size={12} />
                            Descargar Ficha PDF
                        </a>
                    )}
                </div>
            </div>

            {/* Calendario Semanal de la Matrícula */}
            <div className="bg-white border border-border rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                    <CalendarDays className="text-primary" size={20} />
                    <h5 className="font-heading font-bold text-text-heading text-sm">Visualización del Horario Inscrito</h5>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed min-w-[700px] border-collapse text-center">
                        <thead>
                            <tr className="border-b border-border bg-bg-alt/20">
                                <th className="py-2.5 px-2 border-r border-border text-[0.68rem] font-bold text-text-muted uppercase w-[80px]">Hora</th>
                                {DIAS_SEMANA.map(dia => (
                                    <th key={dia} className="py-2.5 px-2 border-r border-border text-[0.68rem] font-bold text-text-heading uppercase last:border-r-0">
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
                                            const esFilaInicio = bloque.inicio === hora;
                                            return (
                                                <td 
                                                    key={dia} 
                                                    className={`py-1 px-1 border-r border-border last:border-r-0 text-[0.7rem] leading-tight font-bold transition-all ${bloque.colorClass} border-l-2`}
                                                >
                                                    {esFilaInicio ? (
                                                        <div className="flex flex-col items-center justify-center">
                                                            <span className="truncate max-w-full block font-heading">{bloque.cursoNombre}</span>
                                                            <span className="text-[0.6rem] opacity-75 mt-0.5">Secc. {bloque.seccionCodigo}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-1 opacity-20 bg-current rounded-full" />
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

            {/* Detalle de Asignaturas Seleccionadas */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-border bg-bg-alt/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="text-primary" size={20} />
                        <h5 className="font-heading font-bold text-text-heading text-sm">Lista de Asignaturas Solicitadas</h5>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1 bg-primary/10 text-primary uppercase rounded-full">
                        Total Créditos: {matricula.total_creditos}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse text-left">
                        <thead>
                            <tr className="border-b border-border text-[0.7rem] font-bold text-text-muted uppercase bg-bg-alt/25">
                                <th className="py-3 px-5">Código</th>
                                <th className="py-3 px-5">Curso</th>
                                <th className="py-3 px-5 text-center">Sección</th>
                                <th className="py-3 px-5 text-center">Créditos</th>
                                <th className="py-3 px-5">Horario Detallado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matricula.cursos.map((c, idx) => (
                                <tr key={idx} className="border-b border-border hover:bg-bg-alt/10 last:border-none transition-colors">
                                    <td className="py-4 px-5 font-mono text-xs font-bold text-text-muted">{c.codigo}</td>
                                    <td className="py-4 px-5 font-bold text-text-heading">{c.nombre}</td>
                                    <td className="py-4 px-5 text-center font-bold text-primary">Sección {c.seccion_codigo}</td>
                                    <td className="py-4 px-5 text-center font-bold text-text-main">{c.creditos} CR</td>
                                    <td className="py-4 px-5 text-xs text-text-muted leading-relaxed font-semibold">
                                        {c.horarios && c.horarios.length > 0 ? (
                                            <div className="flex flex-col gap-0.5">
                                                {c.horarios.map((h, hIdx) => (
                                                    <div key={hIdx} className="flex items-center gap-1.5">
                                                        <span className="capitalize text-primary font-extrabold">{h.dia.toLowerCase()}</span>: 
                                                        <span>{h.horaInicio} - {h.horaFin}</span>
                                                        {h.docente_nombre && (
                                                            <span className="text-[0.65rem] text-text-light italic font-normal">({h.docente_nombre})</span>
                                                        )}
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

            {/* Banner de Pago Local */}
            {pagoRegistrado && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-4 text-emerald-950 shadow-xs">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-emerald-600 shrink-0" size={24} />
                        <div className="flex flex-col">
                            <span className="text-[0.62rem] font-bold text-emerald-700 uppercase">Pago de Matrícula Cargado</span>
                            <span className="text-xs font-semibold mt-0.5">
                                Monto: <b className="text-emerald-950 font-bold">S/ {pagoRegistrado.monto.toFixed(2)}</b> vía <b className="capitalize font-bold">{pagoRegistrado.metodo_pago}</b> 
                                {pagoRegistrado.codigo_operacion && <> (Op: <b className="font-mono font-bold">{pagoRegistrado.codigo_operacion}</b>)</>}.
                            </span>
                        </div>
                    </div>
                    {!pagoRegistrado.confirmado_previo && (
                        <button
                            onClick={quitarPagoLocal}
                            className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                            Quitar Pago
                        </button>
                    )}
                </div>
            )}

            {/* Panel de Decisiones del Administrador */}
            {matricula.estado === 'pendiente' && (
                <div className="flex flex-wrap items-center justify-between gap-4 bg-bg-alt/30 border border-border p-4 rounded-2xl">
                    <div className="flex items-center gap-3">
                        {!pagoRegistrado && (
                            <button
                                type="button"
                                onClick={() => setMostrarModalPago(true)}
                                className="flex items-center gap-2 px-5 py-2.5 border border-primary/20 hover:border-transparent text-primary hover:text-white bg-primary/5 hover:bg-primary text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                                <CreditCard size={14} />
                                Registrar Pago
                            </button>
                        )}
                        
                        {matricula.estado === 'pendiente' && (
                            <button
                                type="button"
                                onClick={manejarRechazoMatricula}
                                className="flex items-center gap-2 px-5 py-2.5 border border-red-200 hover:border-transparent text-red-600 hover:text-white bg-red-50 hover:bg-red-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                                <X size={14} />
                                Rechazar Solicitud
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={procesando}
                        onClick={manejarConfirmacionMatricula}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                        {procesando ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <Check size={14} />
                        )}
                        Confirmar y Validar Matrícula
                    </button>
                </div>
            )}

            {/* MODAL PARA REGISTRO DE PAGO (VANILLA CSS) */}
            {mostrarModalPago && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
                    <div className="bg-white border border-border rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-scale-in">
                        
                        {/* Cabecera Modal */}
                        <div className="bg-bg-alt/50 px-5 py-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-primary font-bold">
                                <Coins size={18} />
                                <h4 className="font-heading font-bold text-text-heading text-sm">Registrar Pago de Matrícula</h4>
                            </div>
                            <button 
                                onClick={() => setMostrarModalPago(false)}
                                className="text-text-light hover:text-text-heading transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Formulario Modal */}
                        <form onSubmit={guardarDatosPagoModal} className="p-5 flex flex-col gap-4">
                            {/* Monto */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[0.68rem] font-bold text-text-light uppercase">Monto de Operación (S/)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    value={montoPago}
                                    onChange={(e) => setMontoPago(e.target.value)}
                                    className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Método de Pago */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[0.68rem] font-bold text-text-light uppercase">Método de Pago</label>
                                <select 
                                    value={metodoPago}
                                    onChange={(e) => setMetodoPago(e.target.value)}
                                    className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                                >
                                    <option value="transferencia">Transferencia Bancaria</option>
                                    <option value="deposito">Depósito en Ventanilla</option>
                                    <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                                    <option value="efectivo">Efectivo (Caja)</option>
                                </select>
                            </div>

                            {/* Código de Operación */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[0.68rem] font-bold text-text-light uppercase">Código de Operación / N° Recibo</label>
                                <input 
                                    type="text"
                                    placeholder="Ej: TX-99887766"
                                    value={codigoOperacion}
                                    onChange={(e) => setCodigoOperacion(e.target.value)}
                                    className="w-full px-3 py-2 bg-bg-alt/25 border border-border rounded-lg text-xs font-semibold text-text-heading focus:border-primary focus:outline-none"
                                />
                            </div>

                            {/* Botones de Acción */}
                            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setMostrarModalPago(false)}
                                    className="px-4 py-2 border border-border text-text-muted hover:text-text-heading text-xs font-bold bg-white transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                                >
                                    Cargar Pago
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
}
