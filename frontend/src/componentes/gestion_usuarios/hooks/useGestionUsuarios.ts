/* ======================================
   hooks/useGestionUsuarios.ts
   Hook para consultar, crear, editar y eliminar usuarios
   ====================================== */

import { useState, useMemo, useCallback } from 'react';
import { USUARIOS_REGISTRADOS } from '@/data/usuarios';
import type { UsuarioData, UserRole, Permission } from '@/data/usuarios';
import type { FiltrosUsuarios } from '../types';

const FILTROS_INICIALES: FiltrosUsuarios = {
  username: '',
  role: '',
  nombreCompleto: '',
};

/** Plantilla para nuevo usuario */
const USUARIO_VACIO: UsuarioData = {
  id: '',
  username: '',
  password: '',
  role: 'tecnico',
  permissions: [],
  nombreCompleto: '',
  email: '',
};

/** Mapa de permisos por defecto según el rol */
export const PERMISOS_POR_ROL: Record<UserRole, Permission[]> = {
  admin: [
    'view-estadisticas',
    'view-registro-reportes',
    'view-busqueda-reportes',
    'view-gestion-registros',
    'view-gestion-usuarios',
  ],
  tecnico: [
    'view-estadisticas',
    'view-busqueda-reportes',
  ],
  administrativo: [
    'view-estadisticas',
    'view-registro-reportes',
    'view-busqueda-reportes',
    'view-gestion-registros',
  ],
};

/** Etiquetas legibles para cada permiso */
export const ETIQUETAS_PERMISOS: Record<Permission, string> = {
  'view-estadisticas': 'Ver Estadísticas',
  'view-registro-reportes': 'Registrar Reportes',
  'view-busqueda-reportes': 'Buscar Reportes',
  'view-gestion-registros': 'Gestionar Registros',
  'view-gestion-usuarios': 'Gestionar Usuarios',
};

/** Opciones para el select de roles */
export const OPCIONES_ROLES: Array<{ value: string; label: string }> = [
  { value: 'admin', label: 'Administrador' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'administrativo', label: 'Administrativo' },
];

/** Opciones para el campo lista-items de permisos */
export const OPCIONES_PERMISOS: Array<{ value: string; label: string }> = [
  { value: 'view-estadisticas', label: 'Ver Estadísticas' },
  { value: 'view-registro-reportes', label: 'Registrar Reportes' },
  { value: 'view-busqueda-reportes', label: 'Buscar Reportes' },
  { value: 'view-gestion-registros', label: 'Gestionar Registros' },
  { value: 'view-gestion-usuarios', label: 'Gestionar Usuarios' },
];

let siguienteId = USUARIOS_REGISTRADOS.length + 1;

export function useGestionUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>(USUARIOS_REGISTRADOS);
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({ ...FILTROS_INICIALES });
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioData | null>(null);
  const [modoCrear, setModoCrear] = useState(false);
  const [cargando, setCargando] = useState(false);

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
      resultado = resultado.filter(u => u.username.toLowerCase().includes(term));
    }
    if (filtros.role) {
      resultado = resultado.filter(u => u.role === filtros.role);
    }
    if (filtros.nombreCompleto.trim()) {
      const term = filtros.nombreCompleto.toLowerCase().trim();
      resultado = resultado.filter(u =>
        u.nombreCompleto?.toLowerCase().includes(term)
      );
    }

    return resultado;
  }, [usuarios, filtros]);

  const iniciarEdicion = useCallback((usuario: UsuarioData) => {
    setUsuarioEditando(usuario);
    setModoCrear(false);
  }, []);

  const iniciarCreacion = useCallback(() => {
    setUsuarioEditando({
      ...USUARIO_VACIO,
      id: `USR-NEW-${siguienteId++}`,
    });
    setModoCrear(true);
  }, []);

  const guardarEdicion = useCallback(async (datos: Record<string, any>): Promise<boolean> => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fusionar permisos del rol + permisos adicionales seleccionados
      const role = datos.role as UserRole;
      const permisosBase = PERMISOS_POR_ROL[role] || [];
      const permisosAdicionales: string[] = datos.permissions || [];
      const permisosFinales = Array.from(new Set([...permisosBase, ...permisosAdicionales]));

      const usuarioFinal = {
        ...datos,
        permissions: permisosFinales,
      } as UsuarioData;

      if (modoCrear) {
        setUsuarios(prev => [...prev, usuarioFinal]);
      } else {
        setUsuarios(prev =>
          prev.map(u => (u.id === datos.id ? usuarioFinal : u))
        );
      }
      setUsuarioEditando(null);
      setModoCrear(false);
      return true;
    } finally {
      setCargando(false);
    }
  }, [modoCrear]);

  const eliminarUsuario = useCallback(async (usuario: UsuarioData): Promise<boolean> => {
    setCargando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsuarios(prev => prev.filter(u => u.id !== usuario.id));
      return true;
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
    cargando,
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