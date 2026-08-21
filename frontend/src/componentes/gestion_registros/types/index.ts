/* ======================================
   types/index.ts — Tipos específicos para Gestión de Registros
   ====================================== */

/** Acción realizada en el historial */
export type AccionHistorial = 'creacion' | 'edicion' | 'eliminacion' | 'restauracion';

/** Entrada individual del historial de cambios */
export interface EntradaHistorial {
  id: number;
  reporteId: number | null;
  numeroReporte: string | null;
  accion: AccionHistorial;
  usuario: string;
  fecha: string;
  hora?: string;
  descripcion: string;
  camposModificados?: string[];
  valorAnterior?: string;
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
  estado: 'todos' | 'activos' | 'inactivos';
  ordenarPor: 'id' | 'nombre';
  ordenDireccion: 'asc' | 'desc';
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
  render?: (valor: any, fila: T) => React.ReactNode;
  ordenable?: boolean;
  className?: string;
  minWidth?: string;
}

/** Acción disponible en una fila de TablaGenerica */
export interface AccionFila<T = any> {
  etiqueta: string;
  icono?: React.ReactNode;
  onClick: (fila: T) => void;
  variant?: 'primary' | 'danger' | 'secondary';
  visible?: (fila: T) => boolean;
}

// ==========================================
// Tipos de entidades (responden del backend)
// ==========================================

export interface Cliente {
  id: number;
  nombre: string;
  rif?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  activo: boolean;
}

export interface Etiqueta {
  id: number;
  nombre: string;
  color?: string;
}

export interface Plantilla {
  id: number;
  nombre: string;
  descripcion?: string;
  equipo?: string;
  descripcionFalla?: string;
  trabajoRealizado?: string;
  estado?: { id: number; nombre: string } | null;
  etiqueta?: { id: number; nombre: string } | null;
}

export interface ReporteResumen {
  id: number;
  numeroReporte: string;
  cliente: string;
  clienteId: number;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiqueta: string;
  etiquetaId: number;
  tecnico: string;
  tecnicoId: number;
  estado: string;
  estadoId: number;
  repuesto: string;
  repuestoId: number;
  repuestos: { id: number; nombre: string; cantidad: number }[];
  posibleCausa?: string;
  anotaciones?: string;
  reportadoPor?: string;
}
