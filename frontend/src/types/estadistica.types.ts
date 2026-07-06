/**
 * Tipos para el módulo de Estadísticas
 */
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
  reportesPorMes: ReportesPorMes;
  tecnicosTop: TecnicoTop[];
}