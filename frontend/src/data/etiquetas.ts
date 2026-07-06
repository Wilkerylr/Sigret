/**
 * Datos de etiquetas simuladas (reemplazará la llamada a la API /api/etiquetas)
 */

export interface Etiqueta {
  id: string;
  nombre: string;
  color?: string;
  descripcion?: string;
}

export const ETIQUETAS: Etiqueta[] = [
  { id: 'ETQ-001', nombre: 'Mantenimiento', color: '#3b82f6', descripcion: 'Mantenimiento preventivo o correctivo' },
  { id: 'ETQ-002', nombre: 'Reparación', color: '#ef4444', descripcion: 'Reparación de equipo dañado' },
  { id: 'ETQ-003', nombre: 'Inspección', color: '#f59e0b', descripcion: 'Inspección rutinaria' },
  { id: 'ETQ-004', nombre: 'Mantenimiento esporádico', color: '#8b5cf6', descripcion: 'Mantenimiento no planificado' },
];

export const NOMBRES_ETIQUETAS = ETIQUETAS.map((e) => e.nombre);