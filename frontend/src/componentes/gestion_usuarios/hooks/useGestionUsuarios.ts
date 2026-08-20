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
  permisos: string[];
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
    permisos: (data.permisos || []).map(p => String(p.id)),
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
      console.error('[GESTION USUARIOS] Error al cargar usuarios:', error);
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

      const payload = {
        nombre_usuario: nombre,
        apellido_usuario: apellido,
        email_usuario: datos.email_usuario || `${nombre.toLowerCase()}@email.com`,
        contraseña: datos.contraseña || '',
        rol_usuario: Number(datos.rol_usuario),
        permisos: (datos.permisos || []).filter(Boolean),
      };

      if (modoCrear) {
        await apiClient.post(ENDPOINTS.USUARIOS.REGISTER, payload);
      } else {
        await apiClient.put(ENDPOINTS.USUARIOS.BY_ID(datos.id as string), {
          nombre_usuario: payload.nombre_usuario,
          apellido_usuario: payload.apellido_usuario,
          email: payload.email_usuario,
          rol_usuario: payload.rol_usuario,
          permisos: payload.permisos,
        });
      }

      await cargarUsuarios();
      setUsuarioEditando(null);
      setModoCrear(false);
      return true;
    } catch (error: any) {
      console.error('[GESTION USUARIOS] Error al guardar:', error?.response?.data || error);
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
      return true;
    } catch (error) {
      console.error('[GESTION USUARIOS] Error al eliminar:', error);
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