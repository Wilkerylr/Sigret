/**
 * Datos de declaraciones de estado (reemplazará la llamada a la API /api/declaraciones)
 */

export interface Declaracion {
  id: string;
  nombre: string;
  descripcion: string;
}

export const DECLARACIONES: Declaracion[] = [
  { id: 'DEC-001', nombre: 'Operativo', descripcion: 'El equipo funciona correctamente' },
  { id: 'DEC-002', nombre: 'Inoperativo', descripcion: 'El equipo no funciona' },
  { id: 'DEC-003', nombre: 'No aplica', descripcion: 'No aplica para este equipo' },
  { id: 'DEC-004', nombre: 'Operativo bajo observación', descripcion: 'Funciona pero requiere monitoreo' },
];

export const NOMBRES_DECLARACIONES = DECLARACIONES.map((d) => d.nombre);

/**
 * Valores normalizados (lowercase) para compatibilidad
 */
export const VALORES_DECLARACION = DECLARACIONES.map((d) => ({
  value: d.nombre.toLowerCase().replace(/\s+/g, '_'),
  label: d.nombre,
}));