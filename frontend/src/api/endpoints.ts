/**
 * Constantes de rutas de API
 * Centraliza todas las URLs para facilitar mantenimiento y cambios
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  REPORTES: {
    BASE: '/reportes',
    BY_ID: (id: string) => `/reportes/${id}`,
  },
  CLIENTES: {
    BASE: '/clientes',
    BY_ID: (id: string) => `/clientes/${id}`,
  },
  EQUIPOS: {
    BASE: '/equipos',
    BY_ID: (id: string) => `/equipos/${id}`,
  },
  REPUESTOS: {
    BASE: '/repuestos',
    BY_ID: (id: string) => `/repuestos/${id}`,
  },
  ETIQUETAS: {
    BASE: '/etiquetas',
    BY_ID: (id: string) => `/etiquetas/${id}`,
  },
  TECNICOS: {
    BASE: '/tecnicos',
    BY_ID: (id: string) => `/tecnicos/${id}`,
  },
  PLANTILLAS: {
    BASE: '/plantillas',
    BY_ID: (id: string) => `/plantillas/${id}`,
  },
  USUARIOS: {
    BASE: '/usuarios',
    BY_ID: (id: string) => `/usuarios/${id}`,
  },
  ESTADISTICAS: {
    BASE: '/estadisticas',
    REPORTES_POR_MES: '/estadisticas/reportes-por-mes',
    TECNICOS_TOP: '/estadisticas/tecnicos-top',
  },
  HISTORIAL: {
    BASE: '/historial',
    POR_REPORTE: (id: string) => `/historial/reporte/${id}`,
  },
} as const;