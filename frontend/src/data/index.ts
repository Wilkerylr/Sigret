/**
 * Índice centralizado de datos simulados
 *
 * Este directorio unifica TODA la información que actualmente se simula
 * en el frontend y que eventualmente será reemplazada por llamadas a la API.
 *
 * Estructura:
 * - clientes.ts      → /api/clientes
 * - equipos.ts       → /api/equipos
 * - repuestos.ts     → /api/repuestos
 * - etiquetas.ts     → /api/etiquetas
 * - tecnicos.ts      → /api/tecnicos
 * - plantillas.ts    → /api/plantillas
 * - declaraciones.ts → /api/declaraciones
 * - empleados.ts     → /api/empleados
 * - usuarios.ts      → /api/usuarios
 * - reportes.ts      → /api/reportes
 */

export * from './clientes';
export * from './equipos';
export * from './repuestos';
export * from './etiquetas';
export * from './tecnicos';
export * from './plantillas';
export * from './declaraciones';
export * from './empleados';
export * from './usuarios';
export { REPORTES_PRUEBA, FALLAS_EJEMPLO, TRABAJOS_EJEMPLO } from './reportes';
export type { ReporteResumen } from './reportes';
export { HISTORIAL_PRUEBA } from './historial';
export type { EntradaHistorial } from '@/componentes/gestion_registros/types';
