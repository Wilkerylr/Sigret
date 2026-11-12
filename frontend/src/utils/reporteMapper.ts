/**
 * Mapper único de la respuesta de reportes del backend al modelo del frontend.
 * Evita duplicar la lógica (y los `any`) en cada pantalla.
 */

import type { ReporteApi, ReporteResumen } from '@/types';

export function mapearReporteApi(r: ReporteApi): ReporteResumen {
  const repuestos =
    r.repuestos && r.repuestos.length > 0
      ? r.repuestos
      : r.repuesto
        ? [{ id: r.repuestoId ?? 0, nombre: r.repuesto, cantidad: 1 }]
        : [];

  return {
    id: String(r.id),
    numeroReporte: r.numeroReporte || `REP-${String(r.id).padStart(3, '0')}`,
    cliente: r.cliente ?? '',
    clienteId: r.clienteId ?? null,
    equipo: r.equipo ?? '',
    fechaReporte: r.fechaReporte ?? '',
    fechaAtencion: r.fechaAtencion ?? '',
    horaInicio: r.horaInicio ?? '',
    horaFinalizacion: r.horaFinalizacion ?? '',
    descripcionFalla: r.descripcionFalla ?? '',
    trabajoRealizado: r.trabajoRealizado ?? '',
    etiquetas: r.etiqueta ? [r.etiqueta] : [],
    etiquetaId: r.etiquetaId ?? null,
    tecnicos: r.tecnico ? [r.tecnico] : [],
    tecnicoId: r.tecnicoId ?? null,
    repuestos,
    repuestoId: r.repuestoId ?? null,
    declaracion: r.estado ?? '',
    estadoId: r.estadoId ?? null,
    plantilla: '',
    posibleCausa: r.posibleCausa ?? '',
    anotaciones: r.anotaciones ?? '',
    reportadoPor: r.reportadoPor == null ? '' : String(r.reportadoPor),
  };
}
