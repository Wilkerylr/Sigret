/**
 * Constantes de rutas de API
 * Centraliza todas las URLs para facilitar mantenimiento y cambios
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/perfil',
    CAMBIAR_CONTRASEÑA: '/auth/cambiar-password',
    REFRESH_PERMISSIONS: '/auth/refresh-permissions',
    PREGUNTAS_SEGURIDAD: '/auth/preguntas-seguridad',
    REGISTRAR_PREGUNTAS: '/auth/registrar-preguntas',
    VERIFICAR_PREGUNTAS: '/auth/verificar-preguntas',
    RECUPERAR_CONTRASEÑA: '/auth/recuperar-password',
  },
  REPORTES: {
    BASE: '/reportes',
    BY_ID: (id: string) => `/reportes/${id}`,
    RESTORE: (id: string) => `/reportes/${id}/restaurar`,
  },
  CLIENTES: {
    BASE: '/clientes',
    BY_ID: (id: string) => `/clientes/${id}`,
    RESTORE: (id: string) => `/clientes/${id}/restaurar`,
    LIMPIEZA: '/clientes/inactivos-sin-reportes',
  },
  REPUESTOS: {
    BASE: '/repuestos',
    BY_ID: (id: string) => `/repuestos/${id}`,
  },
  ETIQUETAS: {
    BASE: '/etiquetas',
    BY_ID: (id: string) => `/etiquetas/${id}`,
  },
  ESTADOS_EQUIPOS: {
    BASE: '/estados-equipos',
    BY_ID: (id: string) => `/estados-equipos/${id}`,
  },
  PLANTILLAS: {
    BASE: '/plantillas',
    BY_ID: (id: string) => `/plantillas/${id}`,
  },
  USUARIOS: {
    BASE: '/usuarios',
    BY_ID: (id: string) => `/usuarios/${id}`,
    RESTORE: (id: string) => `/usuarios/${id}/restaurar`,
    REGISTER: '/usuarios/register',
    PERMISOS_ADICIONALES: '/usuarios/permisos-adicionales',
    ROLES: '/usuarios/roles',
  },
  ESTADISTICAS: {
    BASE: '/estadisticas',
    REPORTES_POR_MES: '/estadisticas/reportes-por-mes',
    TECNICOS_TOP: '/estadisticas/tecnicos-top',
  },
  HISTORIAL: {
    BASE: '/modificaciones',
    POR_REPORTE: (id: string) => `/modificaciones/reporte/${id}`,
  },
} as const;