/**
 * Datos de técnicos simulados (reemplazará la llamada a la API /api/tecnicos)
 */

export interface Tecnico {
  id: string;
  nombre: string;
  especialidad?: string;
  telefono?: string;
  email?: string;
}

export const TECNICOS: Tecnico[] = [
  { id: 'TEC-001', nombre: 'Victor', especialidad: 'Redes y Electrónica', telefono: '+58 414-1111111' },
  { id: 'TEC-002', nombre: 'Wilker', especialidad: 'Sistemas y Soporte', telefono: '+58 414-2222222' },
  { id: 'TEC-003', nombre: 'Alexis', especialidad: 'Electrónica y Cableado', telefono: '+58 414-3333333' },
];

export const NOMBRES_TECNICOS = TECNICOS.map((t) => t.nombre);