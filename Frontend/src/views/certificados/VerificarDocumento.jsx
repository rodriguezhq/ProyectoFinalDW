import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { verificarDocumento } from '../../services/servicioCertificados';
import uncpImagen from '../../assets/Escudo_UNCP.png';
import { formatearFechaHora } from '../../utils/fecha';

export default function VerificarDocumento() {
  const { codigoQr } = useParams();
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [estaCargando, setEstaCargando] = useState(true);

  useEffect(() => {
    verificarDocumento(codigoQr)
      .then(setResultado)
      .catch((err) => setError(err.message))
      .finally(() => setEstaCargando(false));
  }, [codigoQr]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-alt p-6 font-sans">
      <div className="w-full max-w-[440px] bg-white rounded-2xl border border-border p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] text-center">
        <img src={uncpImagen} alt="Escudo de la UNCP" className="w-16 h-auto mx-auto mb-4" />
        <h1 className="text-xl font-extrabold text-text-heading mb-1">Verificación de Documento</h1>
        <p className="text-[0.82rem] text-text-muted mb-6">Sistema de Gestión Académica — UNCP</p>

        {estaCargando ? (
          <div className="py-8">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <ShieldX size={48} className="text-red-500" />
            <h2 className="font-bold text-red-700 text-lg">Documento no válido</h2>
            <p className="text-[0.85rem] text-text-muted">
              Este código no corresponde a ningún documento oficial emitido por la UNCP.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <ShieldCheck size={48} className="text-emerald-600" />
            <h2 className="font-bold text-emerald-700 text-lg">Documento auténtico</h2>
            <div className="w-full bg-bg-alt rounded-lg p-4 text-left text-[0.88rem] flex flex-col gap-2 mt-2">
              <div>
                <span className="block text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Tipo de documento</span>
                <span className="font-semibold text-text-heading">{resultado.tipo_documento}</span>
              </div>
              <div>
                <span className="block text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Emitido a</span>
                <span className="font-semibold text-text-heading">{resultado.estudiante_nombre}</span>
              </div>
              <div>
                <span className="block text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Fecha de emisión</span>
                <span className="font-semibold text-text-heading">
                  {formatearFechaHora(resultado.fecha_emision)}
                </span>
              </div>
              <div>
                <span className="block text-[0.72rem] font-bold text-text-muted uppercase tracking-wider">Institución</span>
                <span className="font-semibold text-text-heading">{resultado.institucion}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
