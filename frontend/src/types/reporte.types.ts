/**
 * Tipos para el módulo de Reportes Técnicos
 * Unifica FormReporteData (registro) y ReporteResumen (búsqueda/listado)
 */

export interface Repuesto {
  repuesto: string;
  cantidad: number;
}

export interface ReporteBase {
  cliente: string;
  equipo: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  posibleCausa?: string;
  anotaciones?: string;
  reportadoPor?: string;
  repuestos: Repuesto[];
  declaracion: string;
  etiquetas: string[];
  tecnicos: string[];
  plantilla?: string;
  numeroReporte: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
}

/** Datos completos del formulario de registro (incluye campos auxiliares de UI) */
export interface FormReporteData extends ReporteBase {
  repuestoSeleccionado: string;
  cantidad: string;
  etiquetaSeleccionada: string;
  tecnicoSeleccionado: string;
}

/** Resumen de reporte para listados y búsqueda */
export interface ReporteResumen extends ReporteBase {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  creadoPor?: string;
  motivoEdicion?: string;
}

/** Payload para crear un reporte (sin campos auxiliares de UI) */
export type CreateReporteRequest = ReporteBase;

/** Payload para actualizar un reporte */
export interface UpdateReporteRequest extends Partial<ReporteBase> {
  motivoEdicion: string;
}