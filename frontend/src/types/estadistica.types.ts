/**
 * Tipos para el módulo de Estadísticas
 * Alineados con el contrato real del backend GET /api/estadisticas
 */
export interface DatosPorDia {
  date: string;
  total: number;
}

export interface DatosGrafico {
  mes: string;
  cantidad: number;
}

export interface ReportesPorMes {
  año: number;
  meses: DatosGrafico[];
}

export interface TecnicoTop {
  nombre: string;
  reportesAtendidos: number;
  promedioHoras: number;
}

export interface EstadisticasDashboard {
  totalReportes: number;
  reportesEsteMes: number;
  tecnicosActivos: number;
  clientesAtendidos: number;
  porDia: DatosPorDia[];
  porMes: ReportesPorMes;
  tecnicosTop: TecnicoTop[];
}
