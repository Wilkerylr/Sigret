/**
 * Datos de empleados simulados (reemplazará la llamada a la API /api/empleados)
 */

export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  telefono?: string;
}

export const EMPLEADOS: Empleado[] = [
  { id: 'EMP-001', nombre: 'Encargado 1', cargo: 'Encargado', telefono: '+58 412-9999991' },
  { id: 'EMP-002', nombre: 'Encargado 2', cargo: 'Encargado', telefono: '+58 412-9999992' },
  { id: 'EMP-003', nombre: 'Parkero 1', cargo: 'Parkero', telefono: '+58 412-9999993' },
];

export const NOMBRES_EMPLEADOS = EMPLEADOS.map((e) => e.nombre);