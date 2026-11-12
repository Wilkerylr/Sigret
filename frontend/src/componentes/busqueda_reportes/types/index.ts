/* ======================================
   types/index.ts — Tipos para el módulo de búsqueda de reportes
   ====================================== */

// Modelo único definido en src/types
export type { ReporteResumen, ReporteRepuesto } from '@/types';

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
