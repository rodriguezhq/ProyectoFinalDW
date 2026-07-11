import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { obtenerAuditoria } from '../../services/servicioDireccion';

export function useAuditoria() {
  const [auditorias, setAuditorias] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  // Opciones para filtros dropdown
  const [accionesDisponibles, setAccionesDisponibles] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);

  // Valores de filtros activos
  const [filtroAccion, setFiltroAccion] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');

  // Carga inicial: obtiene todo y extrae los filtros únicos disponibles
  const cargarDatosIniciales = useCallback(async () => {
    setEstaCargando(true);
    try {
      const datos = await obtenerAuditoria();
      const lista = datos.auditorias || [];
      setAuditorias(lista);

      // Extraer acciones únicas para el dropdown
      const accionesUnicas = Array.from(new Set(lista.map(a => a.accion).filter(Boolean)));
      setAccionesDisponibles(accionesUnicas);

      // Extraer usuarios únicos para el dropdown
      const mapaUsuarios = {};
      lista.forEach(a => {
        if (a.id_usuario && !mapaUsuarios[a.id_usuario]) {
          mapaUsuarios[a.id_usuario] = a.usuario_nombre || `ID: ${a.id_usuario}`;
        }
      });
      const listaUsuarios = Object.keys(mapaUsuarios).map(id => ({
        id_usuario: parseInt(id),
        nombre: mapaUsuarios[id]
      }));
      setUsuariosDisponibles(listaUsuarios);
    } catch (error) {
      toast.error(error.message || 'Error al cargar la bitácora de auditoría.');
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Consulta filtrada al servidor
  const consultarFiltrado = async (accion, idUsuario) => {
    setEstaCargando(true);
    try {
      const datos = await obtenerAuditoria(accion, idUsuario);
      setAuditorias(datos.auditorias || []);
    } catch (error) {
      toast.error(error.message || 'Error al filtrar los registros de auditoría.');
    } finally {
      setEstaCargando(false);
    }
  };

  const cambiarFiltroAccion = (nuevaAccion) => {
    setFiltroAccion(nuevaAccion);
    consultarFiltrado(nuevaAccion, filtroUsuario);
  };

  const cambiarFiltroUsuario = (nuevoUsuarioId) => {
    setFiltroUsuario(nuevoUsuarioId);
    consultarFiltrado(filtroAccion, nuevoUsuarioId);
  };

  const limpiarFiltros = () => {
    setFiltroAccion('');
    setFiltroUsuario('');
    consultarFiltrado('', '');
  };

  return {
    auditorias,
    estaCargando,
    accionesDisponibles,
    usuariosDisponibles,
    filtroAccion,
    filtroUsuario,
    cambiarFiltroAccion,
    cambiarFiltroUsuario,
    limpiarFiltros,
    recargarAuditoria: cargarDatosIniciales
  };
}
