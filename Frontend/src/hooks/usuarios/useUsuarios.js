import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { obtenerUsuarios, obtenerRoles, guardarUsuario, actualizarUsuario } from '../../services/servicioUsuarios';
import { obtenerFacultades, obtenerEspecialidades } from '../../services/servicioAcademico';

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [facultades, setFacultades] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [estaCargando, setEstaCargando] = useState(false);

  const cargarDatos = useCallback(async () => {
    setEstaCargando(true);
    try {
      // Cargar lista de usuarios
      const datosUsuarios = await obtenerUsuarios();
      setUsuarios(datosUsuarios.usuarios || []);

      // Cargar roles
      const datosRoles = await obtenerRoles();
      setRoles(datosRoles.roles || []);

      // Cargar facultades
      const datosFacultades = await obtenerFacultades();
      setFacultades(datosFacultades.facultades || []);

      // Cargar especialidades
      const datosEspecialidades = await obtenerEspecialidades();
      setEspecialidades(datosEspecialidades.especialidades || []);
    } catch (error) {
      toast.error(error.message || 'Error al cargar los datos de usuarios.');
    } finally {
      setEstaCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const registrarUsuario = async (datos) => {
    try {
      const respuesta = await guardarUsuario(datos);
      toast.success('Usuario registrado con éxito.');
      await cargarDatos();
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
      await cargarDatos();
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
    recargarDatos: cargarDatos,
    registrarUsuario,
    modificarUsuarioExistente
  };
}
