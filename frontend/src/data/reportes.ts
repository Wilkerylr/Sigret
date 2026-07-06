/**
 * Datos de reportes de servicio simulados (reemplazará la llamada a la API /api/reportes)
 * Unifica la generación de datos de prueba de Busqueda_reportes.tsx
 */

import { NOMBRES_CLIENTES } from './clientes';
import { NOMBRES_EQUIPOS } from './equipos';
import { NOMBRES_ETIQUETAS } from './etiquetas';
import { NOMBRES_TECNICOS } from './tecnicos';
import { NOMBRES_REPUESTOS } from './repuestos';
import { NOMBRES_PLANTILLAS } from './plantillas';
import { NOMBRES_DECLARACIONES } from './declaraciones';

export interface ReporteResumen {
  id: string;
  numeroReporte: string;
  cliente: string;
  equipo: string;
  fechaReporte: string;
  fechaAtencion: string;
  horaInicio: string;
  horaFinalizacion: string;
  descripcionFalla: string;
  trabajoRealizado: string;
  etiquetas: string[];
  tecnicos: string[];
  repuestos: string[];
  declaracion: string;
  plantilla: string;
  posibleCausa?: string;
  anotaciones?: string;
  reportadoPor?: string;
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randItems<T>(arr: T[], max: number): T[] {
  const count = Math.floor(Math.random() * max) + 1;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randDate(start: Date, end: Date): string {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split('T')[0];
}

function pad(n: number): string {
  return n.toString().padStart(3, '0');
}

const FALLAS = [
  'No enciende', 'Sobrecalentamiento', 'Ruido anormal', 'Error de conexión',
  'Pantalla azul', 'Lento rendimiento', 'Sin señal', 'Corte intermitente',
];

const TRABAJOS = [
  'mantenimiento preventivo', 'cambio de pieza', 'revisión general',
  'actualización de firmware', 'limpieza interna', 'reconfiguración',
];

function generarReportesPrueba(): ReporteResumen[] {
  const reportes: ReporteResumen[] = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2026-06-21');

  for (let i = 1; i <= 100; i++) {
    const cliente = randItem(NOMBRES_CLIENTES);
    const equipo = randItem(NOMBRES_EQUIPOS);
    const etiquetas = randItems(NOMBRES_ETIQUETAS, 2);
    const tecnicos = randItems(NOMBRES_TECNICOS, 2);
    const repuestos = Math.random() > 0.4 ? randItems(NOMBRES_REPUESTOS, 3) : [];
    const fechaReporte = randDate(startDate, endDate);
    const fechaAtencion = new Date(
      new Date(fechaReporte).getTime() + Math.random() * 3 * 86400000
    ).toISOString().split('T')[0];
    const falla = randItem(FALLAS);
    const trabajo = randItem(TRABAJOS);

    reportes.push({
      id: String(i),
      numeroReporte: `REP-${pad(i)}`,
      cliente,
      equipo,
      fechaReporte,
      fechaAtencion,
      horaInicio: `${String(7 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      horaFinalizacion: `${String(8 + Math.floor(Math.random() * 10)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      descripcionFalla: `Falla detectada en ${equipo} - ${falla}`,
      trabajoRealizado: `Se realizó ${trabajo} en ${equipo}`,
      etiquetas,
      tecnicos,
      repuestos,
      declaracion: randItem(NOMBRES_DECLARACIONES),
      plantilla: randItem(NOMBRES_PLANTILLAS),
    });
  }

  return reportes;
}

/** Reportes de prueba generados una sola vez */
export const REPORTES_PRUEBA: ReporteResumen[] = generarReportesPrueba();

/** Fallas de ejemplo para uso en formularios */
export const FALLAS_EJEMPLO = FALLAS;

/** Trabajos de ejemplo para uso en formularios */
export const TRABAJOS_EJEMPLO = TRABAJOS;