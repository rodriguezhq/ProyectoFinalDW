import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { obtenerAuditoria } from '../../services/servicioDireccion';
import { obtenerCatalogoUsuarios } from '../../services/servicioUsuarios';
import { ACCIONES_AUDITORIA } from '../../constants/auditoria';

const POR_PAGINA = 10;

export function useAuditoria() {
  const [auditorias, setAuditorias] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  // Opciones para filtros dropdown: ninguna de las dos sale de los datos
  // cargados/filtrados (eso las rompía al re-filtrar), sino de catálogos fijos
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const accionesDisponibles = ACCIONES_AUDITORIA;

  // Valores de filtros activos
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  // El catálogo de usuarios no sale del log de auditoría (no escala con miles
  // de registros) sino de un endpoint dedicado, una sola vez.
  const cargarUsuariosDisponibles = useCallback(async () => {
    try {
      const datos = await obtenerCatalogoUsuarios();
      const lista = (datos.usuarios || []).map(u => ({
        id_usuario: u.id_usuario,
        nombre: [u.nombres, u.apellidos].filter(Boolean).join(' ') || u.username
      }));
      setUsuariosDisponibles(lista);
    } catch (error) {
      // No es crítico para ver la bitácora si falla el catálogo de usuarios
      console.error(error);
    }
  }, []);

  // Trae una pagina puntual y REEMPLAZA lo que se ve (no lo acumula)
  const cargarPagina = useCallback(async (numeroPagina) => {
    setEstaCargando(true);
    try {
      const datos = await obtenerAuditoria(filtroAccion, filtroUsuario, numeroPagina, POR_PAGINA);
      setAuditorias(datos.auditorias || []);
      setPagina(numeroPagina);
      setTotal(datos.total || 0);
    } catch (error) {
      toast.error(error.message || 'Error al cargar la bitácora de auditoría.');
    } finally {
      setEstaCargando(false);
    }
  }, [filtroAccion, filtroUsuario]);

  useEffect(() => {
    cargarUsuariosDisponibles();
  }, [cargarUsuariosDisponibles]);

  // Al cambiar de filtro, siempre se vuelve a la pagina 1
  useEffect(() => {
    cargarPagina(1);
  }, [cargarPagina]);

  const irAPagina = (numeroPagina) => {
    if (numeroPagina < 1 || numeroPagina > totalPaginas || numeroPagina === pagina) return;
    cargarPagina(numeroPagina);
  };

  const cambiarFiltroAccion = (nuevaAccion) => {
    setFiltroAccion(nuevaAccion);
  };

  const cambiarFiltroUsuario = (nuevoUsuarioId) => {
    setFiltroUsuario(nuevoUsuarioId);
  };

  const limpiarFiltros = () => {
    setFiltroAccion('');
    setFiltroUsuario('');
  };

  return {
    auditorias,
    estaCargando,
    pagina,
    totalPaginas,
    total,
    porPagina: POR_PAGINA,
    accionesDisponibles,
    usuariosDisponibles,
    filtroAccion,
    filtroUsuario,
    cambiarFiltroAccion,
    cambiarFiltroUsuario,
    limpiarFiltros,
    irAPagina,
    recargarAuditoria: () => cargarPagina(pagina)
  };
}
