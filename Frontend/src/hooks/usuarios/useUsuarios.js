import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { obtenerUsuarios, obtenerRoles, guardarUsuario, actualizarUsuario } from '../../services/servicioUsuarios';
import { obtenerFacultades, obtenerEspecialidades } from '../../services/servicioAcademico';

const POR_PAGINA = 10;

export function useUsuarios(rolFiltrado = '') {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  // Estados de filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroFacultad, setFiltroFacultad] = useState('');
  const [filtroCiclo, setFiltroCiclo] = useState('');

  const cargarUsuarios = useCallback(async (numeroPagina = 1) => {
    setEstaCargando(true);
    try {
      const datosUsuarios = await obtenerUsuarios(
        numeroPagina,
        POR_PAGINA,
        rolFiltrado,
        filtroNombre,
        filtroFacultad,
        filtroCiclo
      );
      setUsuarios(datosUsuarios.usuarios || []);
      setPagina(numeroPagina);
      setTotal(datosUsuarios.total || 0);
    } catch (error) {
      toast.error(error.message || 'Error al cargar los usuarios.');
    } finally {
      setEstaCargando(false);
    }
  }, [rolFiltrado, filtroNombre, filtroFacultad, filtroCiclo]);

  const cargarCatalogos = useCallback(async () => {
    try {
      const datosRoles = await obtenerRoles();
      setRoles(datosRoles.roles || []);

      const datosFacultades = await obtenerFacultades();
      setFacultades(datosFacultades.facultades || []);

      const datosEspecialidades = await obtenerEspecialidades();
      setEspecialidades(datosEspecialidades.especialidades || []);
    } catch (error) {
      toast.error(error.message || 'Error al cargar los catálogos.');
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Al cambiar de pestaña de rol, se vuelven a los filtros por defecto y página 1
  useEffect(() => {
    setFiltroNombre('');
    setFiltroFacultad('');
    setFiltroCiclo('');
  }, [rolFiltrado]);

  // Recargar cuando cambien los filtros o el rol
  useEffect(() => {
    cargarUsuarios(1);
  }, [cargarUsuarios]);

  const registrarUsuario = async (datos) => {
    try {
      const respuesta = await guardarUsuario(datos);
      toast.success('Usuario registrado con éxito.');
      await cargarUsuarios(1);
      return respuesta;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const modificarUsuarioExistente = async (id, datos) => {
    try {
      const respuesta = await actualizarUsuario(id, datos);
      toast.success('Usuario actualizado con éxito.');
      await cargarUsuarios(pagina);
      return respuesta;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    usuarios,
    roles,
    facultades,
    especialidades,
    estaCargando,
    pagina,
    totalPaginas,
    total,
    filtroNombre,
    setFiltroNombre,
    filtroFacultad,
    setFiltroFacultad,
    filtroCiclo,
    setFiltroCiclo,
    irAPagina: cargarUsuarios,
    recargarDatos: () => cargarUsuarios(pagina),
    registrarUsuario,
    modificarUsuarioExistente
  };
}
