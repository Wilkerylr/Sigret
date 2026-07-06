/**
 * Datos de equipos simulados (reemplazará la llamada a la API /api/equipos)
 */

export interface Equipo {
  id: string;
  nombre: string;
  tipo: string;
  fabricante?: string;
  modelo?: string;
}

export const EQUIPOS: Equipo[] = [
  { id: 'EQ-001', nombre: 'Servidor HP ProLiant DL380', tipo: 'Servidor', fabricante: 'HP' },
  { id: 'EQ-002', nombre: 'Switch Cisco 2960', tipo: 'Red', fabricante: 'Cisco' },
  { id: 'EQ-003', nombre: 'UPS APC 1500VA', tipo: 'Eléctrico', fabricante: 'APC' },
  { id: 'EQ-004', nombre: 'Router MikroTik RB951', tipo: 'Red', fabricante: 'MikroTik' },
  { id: 'EQ-005', nombre: 'Cámara Hikvision DS-2CD', tipo: 'Seguridad', fabricante: 'Hikvision' },
  { id: 'EQ-006', nombre: 'PC Dell Optiplex 3070', tipo: 'Computadora', fabricante: 'Dell' },
  { id: 'EQ-007', nombre: 'Impresora HP LaserJet', tipo: 'Impresión', fabricante: 'HP' },
  { id: 'EQ-008', nombre: 'NAS Synology DS220+', tipo: 'Almacenamiento', fabricante: 'Synology' },
  { id: 'EQ-009', nombre: 'Access Point Ubiquiti UAP-AC', tipo: 'Red', fabricante: 'Ubiquiti' },
  { id: 'EQ-010', nombre: 'Monitor LG 24"', tipo: 'Periférico', fabricante: 'LG' },
  { id: 'EQ-011', nombre: 'Laptop Lenovo ThinkPad', tipo: 'Computadora', fabricante: 'Lenovo' },
  { id: 'EQ-012', nombre: 'Firewall FortiGate 60F', tipo: 'Seguridad', fabricante: 'Fortinet' },
];

export const NOMBRES_EQUIPOS = EQUIPOS.map((e) => e.nombre);