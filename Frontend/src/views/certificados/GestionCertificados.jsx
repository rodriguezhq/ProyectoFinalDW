import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Stamp, QrCode, Download } from 'lucide-react';
import { obtenerTodosLosDocumentos, autorizarDocumento, emitirDocumento, urlPdfDocumento } from '../../services/servicioCertificados';
import Paginacion from '../../components/Paginacion';
import { formatearFecha } from '../../utils/fecha';

const POR_PAGINA = 10;

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

export default function GestionCertificados({ esDireccion = false }) {
  const [documentos, setDocumentos] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [documentoParaAccion, setDocumentoParaAccion] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  const estadoAccionable = esDireccion ? 'solicitado' : 'autorizado';
  const etiquetaAccion = esDireccion ? 'Autorizar' : 'Emitir';
  const IconoAccion = esDireccion ? ShieldCheck : Stamp;

  const cargarDocumentos = useCallback(async (numeroPagina = 1) => {
    setEstaCargando(true);
    try {
      const datos = await obtenerTodosLosDocumentos(numeroPagina, POR_PAGINA);
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

  const confirmarAccion = async () => {
    if (!documentoParaAccion) return;
    setProcesando(true);
    try {
      if (esDireccion) {
        await autorizarDocumento(documentoParaAccion.id_documento);
        toast.success('Documento autorizado. Ya puede ser emitido por Administración.');
      } else {
        await emitirDocumento(documentoParaAccion.id_documento);
        toast.success('Documento emitido con código QR.');
      }
      setDocumentoParaAccion(null);
      cargarDocumentos(pagina);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 animate-slide-up">
        <div>
          <h3 className="flex items-center gap-2 font-heading text-[1.25rem] font-extrabold text-text-heading mb-1">
            <IconoAccion size={20} /> {esDireccion ? 'Autorización de Documentos' : 'Emisión de Certificados'}
          </h3>
          <p className="text-[0.88rem] text-text-muted">
            {esDireccion
              ? 'Autoriza la emisión de certificados y constancias solicitados por los estudiantes.'
              : 'Emite con código QR los documentos ya autorizados por Dirección.'}
          </p>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          {estaCargando ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[0.88rem] text-text-muted">Cargando documentos...</p>
            </div>
          ) : documentos.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No hay documentos solicitados en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-xs text-text-main">
                <thead>
                  <tr className="bg-primary-light text-primary font-bold uppercase tracking-wide border-b border-border">
                    <th className="p-2 border-r border-border/60 text-left">Estudiante</th>
                    <th className="p-2 border-r border-border/60 text-left">Tipo de Documento</th>
                    <th className="p-2 border-r border-border/60 text-center w-32">Fecha Solicitud</th>
                    <th className="p-2 border-r border-border/60 text-center w-28">Estado</th>
                    <th className="p-2 border-r border-border/60 text-center w-32">Código QR</th>
                    <th className="p-2 text-center w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((doc, idx) => {
                    const isEven = idx % 2 === 0;
                    const esAccionable = doc.estado === estadoAccionable;
                    return (
                      <tr key={doc.id_documento} className={`border-b border-border ${isEven ? 'bg-white' : 'bg-[#F8FAFC]'}`}>
                        <td className="p-2 border-r border-border/60 font-semibold text-text-heading">
                          {doc.estudiante_nombre || `ID ${doc.id_estudiante}`}
                          {doc.estudiante_codigo && (
                            <span className="block text-[0.7rem] font-mono text-text-muted">{doc.estudiante_codigo}</span>
                          )}
                        </td>
                        <td className="p-2 border-r border-border/60 text-text-heading">{doc.tipo_documento}</td>
                        <td className="p-2 border-r border-border/60 text-center text-text-muted">
                          {formatearFecha(doc.fecha_solicitado)}
                        </td>
                        <td className="p-2 border-r border-border/60 text-center">
                          <span className={`inline-block py-0.5 px-2.5 rounded-full font-bold border ${ESTADO_ESTILOS[doc.estado] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {ESTADO_LABEL[doc.estado] || doc.estado}
                          </span>
                        </td>
                        <td className="p-2 border-r border-border/60 text-center">
                          {doc.codigo_qr ? (
                            <span className="flex items-center justify-center gap-1 font-mono text-[0.7rem]">
                              <QrCode size={14} /> {doc.codigo_qr}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {esAccionable ? (
                            <button
                              type="button"
                              onClick={() => setDocumentoParaAccion(doc)}
                              className="flex items-center gap-1 mx-auto text-[10px] px-2 py-1 bg-primary hover:bg-primary-hover border border-primary text-white font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              <IconoAccion size={12} /> {etiquetaAccion}
                            </button>
                          ) : doc.estado === 'emitido' ? (
                            <a
                              href={urlPdfDocumento(doc.id_documento)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 mx-auto w-fit text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-border text-text-heading font-bold uppercase tracking-wider transition-all cursor-pointer"
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

      {/* Modal de confirmación */}
      {documentoParaAccion && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => !procesando && setDocumentoParaAccion(null)}>
          <div className="bg-white rounded-2xl border border-border shadow-2xl max-w-[420px] w-full p-6 animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <IconoAccion size={28} />
            </div>
            <h3 className="font-heading font-extrabold text-[1.1rem] text-text-heading mb-2">
              ¿{etiquetaAccion} este documento?
            </h3>
            <p className="text-[0.88rem] text-text-muted mb-2">
              <strong>{documentoParaAccion.tipo_documento}</strong> — {documentoParaAccion.estudiante_nombre || `Estudiante ID ${documentoParaAccion.id_estudiante}`}
            </p>
            <p className="text-[0.82rem] text-text-muted mb-6">
              {esDireccion
                ? 'Esto habilita a Administración para emitirlo con código QR.'
                : 'Esto genera el código QR y marca el documento como emitido oficialmente.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDocumentoParaAccion(null)}
                disabled={procesando}
                className="py-2 px-4 text-[0.88rem] font-semibold border border-border rounded-md hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarAccion}
                disabled={procesando}
                className="bg-primary text-white py-2 px-5 font-bold text-[0.88rem] rounded-md hover:bg-primary-hover transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {procesando ? 'Procesando...' : `Confirmar ${etiquetaAccion}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
