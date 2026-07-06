/**
 * Datos de clientes simulados (reemplazará la llamada a la API /api/clientes)
 */

export interface Cliente {
  id: string;
  nombre: string;
  rif?: string;
  telefono?: string;
  direccion?: string;
  email?: string;
}

export const CLIENTES: Cliente[] = [
  { id: 'CLI-001', nombre: 'Admin 951', rif: 'J-12345678-1', telefono: '+58 412-1111111' },
  { id: 'CLI-002', nombre: 'Parking paraiso', rif: 'J-23456789-2', telefono: '+58 412-2222222' },
  { id: 'CLI-003', nombre: 'Admin maralva', rif: 'J-34567890-3', telefono: '+58 412-3333333' },
  { id: 'CLI-004', nombre: 'Condominio torre la noria', rif: 'J-45678901-4', telefono: '+58 412-4444444' },
  { id: 'CLI-005', nombre: 'Altamira tennis club', rif: 'J-56789012-5', telefono: '+58 412-5555555' },
  { id: 'CLI-006', nombre: 'Inv kk 2002', rif: 'J-67890123-6', telefono: '+58 412-6666666' },
  { id: 'CLI-007', nombre: 'Admin omiwi', rif: 'J-78901234-7', telefono: '+58 412-7777777' },
  { id: 'CLI-008', nombre: 'Inv clamarxui', rif: 'J-89012345-8', telefono: '+58 412-8888888' },
];

/** Nombres de clientes (compatibilidad con código existente) */
export const NOMBRES_CLIENTES = CLIENTES.map((c) => c.nombre);