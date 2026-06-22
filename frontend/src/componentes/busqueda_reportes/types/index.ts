/* ======================================
   types/index.ts — Tipos para el módulo de búsqueda de reportes
   ====================================== */

export interface ReporteResumen {
  id: string;
  numeroReporte: string;
  cliente: string;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiquetas: string[];
  tecnicos: string[];
  repuestos: string[];
  declaracion: string;
  plantilla: string;
}

export interface FiltrosBusqueda {
  numeroReporte: string;
  etiqueta: string;
  cantidadReportes: string;
  repuesto: string;
  fechaDesde: string;
  fechaHasta: string;
  tecnico: string;
}

export const FILTROS_INICIALES: FiltrosBusqueda = {
  numeroReporte: '',
  etiqueta: '',
  cantidadReportes: '',
  repuesto: '',
  fechaDesde: '',
  fechaHasta: '',
  tecnico: '',
};

// Re-exportado del componente reutilizable
export type { OpcionCombobox } from '@/componentes/ui/combobox-con-buscador';