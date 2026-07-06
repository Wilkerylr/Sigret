/**
 * Datos de repuestos simulados (reemplazará la llamada a la API /api/repuestos)
 */

export interface Repuesto {
  id: string;
  nombre: string;
  descripcion?: string;
  precioReferencia?: number;
}

export const REPUESTOS: Repuesto[] = [
  { id: 'REP-001', nombre: 'Batería', descripcion: 'Batería estándar para UPS', precioReferencia: 25 },
  { id: 'REP-002', nombre: 'Disco Duro SSD', descripcion: 'SSD 480GB SATA III', precioReferencia: 60 },
  { id: 'REP-003', nombre: 'Memoria RAM', descripcion: 'DDR4 8GB 3200MHz', precioReferencia: 35 },
  { id: 'REP-004', nombre: 'Fuente de Poder', descripcion: 'Fuente 500W 80+ Bronze', precioReferencia: 45 },
  { id: 'REP-005', nombre: 'Ventilador', descripcion: 'Ventilador 120mm para gabinete', precioReferencia: 10 },
  { id: 'REP-006', nombre: 'Cable HDMI', descripcion: 'HDMI 2.0 2 metros', precioReferencia: 8 },
  { id: 'REP-007', nombre: 'Teclado', descripcion: 'Teclado USB estándar', precioReferencia: 15 },
  { id: 'REP-008', nombre: 'Mouse', descripcion: 'Mouse óptico USB', precioReferencia: 10 },
  { id: 'REP-009', nombre: 'Monitor', descripcion: 'Monitor LED 22"', precioReferencia: 120 },
  { id: 'REP-010', nombre: 'Router', descripcion: 'Router inalámbrico WiFi 6', precioReferencia: 80 },
];

export const NOMBRES_REPUESTOS = REPUESTOS.map((r) => r.nombre);