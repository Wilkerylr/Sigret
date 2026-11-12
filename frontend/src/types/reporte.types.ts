/**
 * Tipos canónicos para el módulo de Reportes Técnicos.
 *
 * `ReporteApi` describe la respuesta cruda del backend (camelCase) y
 * `ReporteResumen` es el modelo único que consumen la búsqueda, la gestión
 * de registros y los formularios de edición.
 */

/** Repuesto asociado a un reporte tal como lo devuelve la API */
export interface ReporteRepuesto {
  id: number;
  nombre: string;
  cantidad: number;
}

/** Respuesta cruda de GET /api/reportes */
export interface ReporteApi {
  id: number;
  numeroReporte: string;
  cliente: string | null;
  clienteId: number | null;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiqueta: string | null;
  etiquetaId: number | null;
  tecnico: string | null;
  tecnicoId: number | null;
  estado: string | null;
  estadoId: number | null;
  repuestos?: ReporteRepuesto[];
  repuesto: string | null;
  repuestoId: number | null;
  posibleCausa: string | null;
  anotaciones: string | null;
  reportadoPor: number | string | null;
}

/** Modelo único de reporte para listados, búsqueda y edición */
export interface ReporteResumen {
  id: string;
  numeroReporte: string;
  cliente: string;
  clienteId?: number | null;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiquetas: string[];
  etiquetaId?: number | null;
  tecnicos: string[];
  tecnicoId?: number | null;
  repuestos: ReporteRepuesto[];
  repuestoId?: number | null;
  declaracion: string;
  estadoId?: number | null;
  plantilla: string;
  posibleCausa?: string;
  anotaciones?: string;
  reportadoPor?: string;
}
