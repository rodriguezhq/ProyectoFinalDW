import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { FileText, Send, QrCode, Download } from 'lucide-react';
import { solicitarDocumento, obtenerMisDocumentos, urlPdfDocumento } from '../../services/servicioCertificados';
import Paginacion from '../../components/Paginacion';
import { formatearFecha } from '../../utils/fecha';

const POR_PAGINA = 10;

const TIPOS_DOCUMENTO = [
  'Constancia de Matrícula',
  'Constancia de Estudios',
  'Certificado de Notas',
  'Récord Académico',
];

const ESTADO_ESTILOS = {
  solicitado: 'bg-amber-50 text-amber-700 border-amber-200/50',
  autorizado: 'bg-blue-50 text-blue-700 border-blue-200/50',
  emitido: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
};

const ESTADO_LABEL = {
  solicitado: 'Solicitado',
  autorizado: 'Autorizado',
  emitido: 'Emitido',
};

export default function MisCertificados() {
  const [documentos, setDocumentos] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [tipoDocumento, setTipoDocumento] = useState(TIPOS_DOCUMENTO[0]);
  const [enviando, setEnviando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const cargarDocumentos = useCallback(async (numeroPagina = 1) => {
    setEstaCargando(true);
    try {
      const datos = await obtenerMisDocumentos(numeroPagina, POR_PAGINA);
      setDocumentos(datos.documentos || []);
      setPagina(numeroPagina);
      setTotal(datos.total || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDocumentos(1);
  }, [cargarDocumentos]);

  const manejarSolicitar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await solicitarDocumento(tipoDocumento);
      toast.success('Solicitud registrada. El área de Dirección debe autorizarla.');
      cargarDocumentos(1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 lg:px-2 animate-slide-up">
      <div>
        <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
          <FileText size={20} /> Certificados y Constancias
        </h3>
        <p className="text-[0.88rem] text-text-muted">Solicita certificados y constancias en línea y sigue su estado.</p>
      </div>

      <form onSubmit={manejarSolicitar} className="bg-white border border-border rounded-none shadow-none p-3 flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex flex-col gap-1.5 grow">
          <label htmlFor="tipo-documento" className="text-[0.78rem] font-bold text-text-muted uppercase">Tipo de documento</label>
          <select
            id="tipo-documento"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            className="p-2.5 border border-border rounded-none focus:outline-none focus:border-primary text-[0.88rem] bg-white cursor-pointer"
          >
            {TIPOS_DOCUMENTO.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="flex items-center justify-center gap-1.5 bg-primary text-white py-2.5 px-5 text-[0.88rem] font-bold rounded-none transition-all duration-300 hover:bg-primary-hover shadow-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send size={16} /> {enviando ? 'Enviando...' : 'Solicitar'}
        </button>
      </form>

      <div className="bg-white border border-border rounded-none shadow-none overflow-hidden">
        {estaCargando ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-[0.88rem] text-text-muted">Cargando tus documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            Todavía no has solicitado ningún certificado o constancia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-xs text-text-main">
              <thead>
                <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                  <th className="p-2 border-r border-border/60 text-left">Tipo de Documento</th>
                  <th className="p-2 border-r border-border/60 text-center w-36">Fecha de Solicitud</th>
                  <th className="p-2 border-r border-border/60 text-center w-28">Estado</th>
                  <th className="p-2 border-r border-border/60 text-center w-32">Código QR</th>
                  <th className="p-2 text-center w-28">Documento</th>
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr key={doc.id_documento} className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                      <td className="p-2 border-r border-border/60 font-semibold text-text-heading">{doc.tipo_documento}</td>
                      <td className="p-2 border-r border-border/60 text-center text-text-muted">
                        {formatearFecha(doc.fecha_solicitado)}
                      </td>
                      <td className="p-2 border-r border-border/60 text-center">
                        <span className={`inline-block py-0.5 px-2 rounded-none font-bold border ${ESTADO_ESTILOS[doc.estado] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {ESTADO_LABEL[doc.estado] || doc.estado}
                        </span>
                      </td>
                      <td className="p-2 border-r border-border/60 text-center">
                        {doc.codigo_qr ? (
                          <span className="flex items-center justify-center gap-1 font-mono text-[0.7rem] text-text-heading">
                            <QrCode size={14} /> {doc.codigo_qr}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pendiente</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {doc.estado === 'emitido' ? (
                          <a
                            href={urlPdfDocumento(doc.id_documento)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 mx-auto w-fit text-[10px] px-2 py-1 bg-primary hover:bg-primary-hover border border-primary text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <Download size={12} /> PDF
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Paginacion
              cantidadMostrada={documentos.length}
              total={total}
              pagina={pagina}
              totalPaginas={totalPaginas}
              irAPagina={cargarDocumentos}
            />
          </div>
        )}
      </div>
    </div>
  );
}
