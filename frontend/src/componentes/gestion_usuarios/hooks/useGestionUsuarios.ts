import { logError } from '@/lib/logger';
import { mensajeDeError } from '@/utils/errorMessage';
/* ======================================
   hooks/useGestionUsuarios.ts
   Hook para consultar, crear, editar y eliminar usuarios
   Conectado al backend real (/api/usuarios)
   
   FLUJO DE DATOS:
   ─────────────
   API (formatearUsuario) → mapearUsuarioApi → Tabla / Edición
   Formulario (guardar) → mapearAGuardar → API
   ====================================== */

import { useState, useMemo, useCallback, useEffect } from 'react';
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import queryClient from '@/lib/queryClient';
import { PERMISOS_SISTEMA } from '@/componentes/formulario_edicion/configuraciones';
import type { FiltrosUsuarios } from '../types';

export { PERMISOS_SISTEMA };

export const OPCIONES_ROLES = [
  { value: '1', label: 'Administrador' },
  { value: '2', label: 'Técnico' },
  { value: '3', label: 'Administrativo' },
];

export const PERMISOS_POR_ROL: Record<string, string[]> = {
  '1': ['view-estadisticas', 'view-registro-reportes', 'view-busqueda-reportes', 'view-gestion-registros', 'view-gestion-usuarios'],
  '2': ['view-estadisticas', 'view-busqueda-reportes'],
  '3': ['view-estadisticas', 'view-registro-reportes', 'view-busqueda-reportes', 'view-gestion-registros'],
};

const FILTROS_INICIALES: FiltrosUsuarios = {
  username: '',
  role: '',
  nombreCompleto: '',
};

/**
 * Lo que devuelve el backend en GET /api/usuarios
 * (formatearUsuario en routes/usuarios.js)
 */
interface UsuarioApiResponse {
  id: number;
  nombre_usuario: string;
  apellido_usuario: string;
  email: string;
  rol: { id: number; nombre: string } | null;
  permisos: Array<{ id: number; nombre: string; valor: number }>;
  activo: boolean;
}

interface UsuarioFormData {
  id: string;
  nombre_usuario: string;
  apellido_usuario: string;
  email_usuario: string;
  contraseña: string;
  rol_usuario: string;
  permisos: Array<{ id: string; cantidad: string } | string>;
}

/** Mapeo: API → Formulario */
function apiToForm(data: UsuarioApiResponse): UsuarioFormData {
  return {
    id: String(data.id),
    nombre_usuario: data.nombre_usuario,
    apellido_usuario: data.apellido_usuario,
    email_usuario: data.email,
    contraseña: '',
    rol_usuario: String(data.rol?.id || 2),
    permisos: (data.permisos || []).map(p => p.nombre),
  };
}

export function useGestionUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioFormData[]>([]);
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({ ...FILTROS_INICIALES });
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioFormData | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);

  const cargarUsuarios = async () => {
    try {
      setCargandoInicial(true);
      const response = await apiClient.get(ENDPOINTS.USUARIOS.BASE);
      const data = response.data as UsuarioApiResponse[];
      setUsuarios(data.map(apiToForm));
    } catch (error) {
      logError('[GESTION USUARIOS] Error al cargar usuarios:', error);
    } finally {
      setCargandoInicial(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
     
  }, []);

  const actualizarFiltro = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ ...FILTROS_INICIALES });
  }, []);

  const usuariosFiltrados = useMemo(() => {
    let resultado = [...usuarios];
    if (filtros.username.trim()) {
      const term = filtros.username.toLowerCase().trim();
      resultado = resultado.filter(u =>
        u.nombre_usuario.toLowerCase().includes(term)
      );
    }
    if (filtros.role) {
      resultado = resultado.filter(u => u.rol_usuario === filtros.role);
    }
    if (filtros.nombreCompleto.trim()) {
      const term = filtros.nombreCompleto.toLowerCase().trim();
      resultado = resultado.filter(u =>
        `${u.nombre_usuario} ${u.apellido_usuario}`.toLowerCase().includes(term)
      );
    }
    return resultado;
  }, [usuarios, filtros]);

  const iniciarEdicion = useCallback((usuario: UsuarioFormData) => {
    setUsuarioEditando(usuario);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setUsuarioEditando({
      id: '',
      nombre_usuario: '',
      apellido_usuario: '',
      email_usuario: '',
      contraseña: '',
      rol_usuario: '2',
      permisos: [],
    });
    setModoCrear(true);
  }, []);

  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      const nombre = (datos.nombre_usuario || '').trim();
      const apellido = (datos.apellido_usuario || '').trim() || nombre;

      // Extraer solo los IDs (nombres) de los permisos, descartando el objeto { id, cantidad }
      const permisosIds = (datos.permisos || [])
        .map((p: any) => (p && p.id ? p.id : p))
        .filter(Boolean);

      const payload = {
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        email_usuario: datos.email_usuario || `${nombre.toLowerCase()}@email.com`,
        contraseña: datos.contraseña || '',
        rol_usuario: Number(datos.rol_usuario),
        permisos: permisosIds,
      };

      // ─── Log de depuración: ver qué se envía al backend ───
      console.log('[USUARIOS] Guardando usuario:', {
        id: datos.id,
        modo: modoCrear ? 'crear' : 'editar',
        nombre,
        rol: payload.rol_usuario,
        permisosEnviados: payload.permisos,
      });

      if (modoCrear) {
        await apiClient.post(ENDPOINTS.USUARIOS.REGISTER, payload);
      } else {
        const { data } = await apiClient.put(ENDPOINTS.USUARIOS.BY_ID(datos.id as string), {
          nombre_usuario: payload.nombre_usuario,
          apellido_usuario: payload.apellido_usuario,
          email: payload.email_usuario,
          rol_usuario: payload.rol_usuario,
          permisos: payload.permisos,
        });

        // ─── Log de depuración: ver qué respondió el backend ───
        console.log('[USUARIOS] Respuesta del backend:', {
          id: datos.id,
          permisosDevueltos: data?.usuario?.permisos,
          mensaje: data?.message,
        });
      }

      await cargarUsuarios();
      setUsuarioEditando(null);
      setModoCrear(false);
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error: unknown) {
      logError('[GESTION USUARIOS] Error al guardar:', mensajeDeError(error, 'Error desconocido'));
      return false;
    } finally {
      setCargando(false);
    }
  }, [modoCrear]);

  const eliminarUsuario = useCallback(async (usuario: UsuarioFormData): Promise<boolean> => {
    setCargando(true);
    try {
      await apiClient.delete(ENDPOINTS.USUARIOS.BY_ID(usuario.id));
      await cargarUsuarios();
      queryClient.invalidateQueries({ queryKey: ['opciones'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      return true;
    } catch (error) {
      logError('[GESTION USUARIOS] Error al eliminar:', error);
      return false;
    } finally {
      setCargando(false);
    }
  }, []);

  const cancelarEdicion = useCallback(() => {
    setUsuarioEditando(null);
    setModoCrear(false);
  }, []);

  return {
    usuarios: usuariosFiltrados,
    todosUsuarios: usuarios,
    filtros,
    usuarioEditando,
    cargando: cargando || cargandoInicial,
    modoCrear,

    actualizarFiltro,
    limpiarFiltros,
    iniciarEdicion,
    iniciarCreacion,
    guardarEdicion,
    eliminarUsuario,
    cancelarEdicion,
  };
}