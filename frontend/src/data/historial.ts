/* ======================================
   historial.ts — Datos simulados de historial de cambios
   Reemplazará la llamada a la API /api/historial
   ====================================== */

import type { EntradaHistorial } from '@/componentes/gestion_registros/types';

const USUARIOS = ['admin', 'maria_perez', 'carlos_lopez', 'ana_garcia', 'luis_rodriguez'];

const ACCIONES: Array<EntradaHistorial['accion']> = ['creacion', 'edicion', 'eliminacion'];

const CAMPOS_POSIBLES = [
  'cliente', 'equipo', 'descripcionFalla', 'trabajoRealizado',
  'etiquetas', 'tecnicos', 'repuestos', 'declaracion', 'plantilla',
  'fechaReporte', 'fechaAtencion', 'horaInicio', 'horaFinalizacion',
  'posibleCausa', 'anotaciones', 'reportadoPor'
];

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

function randTime(): string {
  return `${String(7 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
}

function generarDescripcion(accion: EntradaHistorial['accion'], campos?: string[]): string {
  switch (accion) {
    case 'creacion':
      return 'Se creó el reporte técnico';
    case 'eliminacion':
      return 'Se eliminó el reporte técnico';
    case 'edicion':
      if (campos && campos.length > 0) {
        return `Se modificaron: ${campos.join(', ')}`;
      }
      return 'Se realizaron modificaciones en el reporte';
    default:
      return 'Cambio registrado';
  }
}

function generarHistorialPrueba(): EntradaHistorial[] {
  const historial: EntradaHistorial[] = [];
  const startDate = new Date('2025-06-01');
  const endDate = new Date('2026-06-28');
  let idCounter = 1;

  for (let i = 1; i <= 80; i++) {
    const accion = randItem(ACCIONES);
    const campos = accion === 'edicion' ? randItems(CAMPOS_POSIBLES, 4) : undefined;
    const fecha = randDate(startDate, endDate);
    const hora = randTime();

    historial.push({
      id: `HIST-${String(idCounter++).padStart(3, '0')}`,
      reporteId: String(Math.floor(Math.random() * 100) + 1),
      numeroReporte: `REP-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      accion,
      usuario: randItem(USUARIOS),
      fecha,
      hora,
      descripcion: generarDescripcion(accion, campos),
      camposModificados: campos,
      valorAnterior: accion === 'edicion' ? 'Valor anterior de ejemplo' : undefined,
      valorNuevo: accion === 'edicion' ? 'Valor nuevo de ejemplo' : undefined,
    });
  }

  // Ordenar por fecha descendente (más reciente primero)
  historial.sort((a, b) => {
    const fechaCompare = b.fecha.localeCompare(a.fecha);
    if (fechaCompare === 0) return b.hora.localeCompare(a.hora);
    return fechaCompare;
  });

  return historial;
}

/** Historial de cambios generado una sola vez */
export const HISTORIAL_PRUEBA: EntradaHistorial[] = generarHistorialPrueba();