/* ======================================
   types/index.ts — Tipos específicos para Gestión de Registros
   ====================================== */

import type { ReporteResumen } from '@/data/reportes';
import type { Cliente } from '@/data/clientes';
import type { Plantilla } from '@/data/plantillas';
import type { Etiqueta } from '@/data/etiquetas';

/** Acción realizada en el historial */
export type AccionHistorial = 'creacion' | 'edicion' | 'eliminacion';

/** Entrada individual del historial de cambios */
export interface EntradaHistorial {
  id: string;
  reporteId: string;
  numeroReporte: string;
  accion: AccionHistorial;
  usuario: string;
  fecha: string;
  hora: string;
  /** Descripción del cambio realizado */
  descripcion: string;
  /** Campos que fueron modificados (solo para edición) */
  camposModificados?: string[];
  /** Valor anterior (solo para edición) */
  valorAnterior?: string;
  /** Valor nuevo (solo para edición) */
  valorNuevo?: string;
}

/** Filtros para el historial */
export interface FiltrosHistorial {
  numeroReporte: string;
  accion: AccionHistorial | '';
  usuario: string;
  fechaDesde: string;
  fechaHasta: string;
}

/** Filtros para la tabla de reportes */
export interface FiltrosReportes {
  numeroReporte: string;
  cliente: string;
  equipo: string;
  etiqueta: string;
  fechaDesde: string;
  fechaHasta: string;
}

/** Filtros para la tabla de clientes */
export interface FiltrosClientes {
  nombre: string;
  rif: string;
  telefono: string;
}

/** Filtros para la tabla de plantillas */
export interface FiltrosPlantillas {
  nombre: string;
  descripcion: string;
}

/** Filtros para la tabla de etiquetas */
export interface FiltrosEtiquetas {
  nombre: string;
}

/** Tab activo en la vista principal */
export type TabActivo = 'reportes' | 'clientes' | 'plantillas' | 'historial' | 'etiquetas';

/** Configuración de columna para TablaGenerica */
export interface ColumnaTabla<T = any> {
  key: string;
  titulo: string;
  /** Función para renderizar el valor (opcional) */
  render?: (valor: any, fila: T) => React.ReactNode;
  /** Si la columna es ordenable */
  ordenable?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** Ancho mínimo */
  minWidth?: string;
}

/** Acción disponible en una fila de TablaGenerica */
export interface AccionFila<T = any> {
  etiqueta: string;
  icono?: React.ReactNode;
  onClick: (fila: T) => void;
  variant?: 'primary' | 'danger' | 'secondary';
  /** Función para ocultar/mostrar la acción según la fila */
  visible?: (fila: T) => boolean;
}

export type { ReporteResumen, Cliente, Plantilla, Etiqueta };