import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { EstadisticasDashboard, ReportesPorMes, TecnicoTop } from '@/types/estadistica.types';

export const estadisticasService = {
  getDashboard: () =>
    apiClient.get<EstadisticasDashboard>(ENDPOINTS.ESTADISTICAS.BASE).then((r) => r.data),
  getReportesPorMes: (anio?: number) =>
    apiClient
      .get<ReportesPorMes>(ENDPOINTS.ESTADISTICAS.REPORTES_POR_MES, { params: { anio } })
      .then((r) => r.data),
  getTecnicosTop: (limite?: number) =>
    apiClient
      .get<TecnicoTop[]>(ENDPOINTS.ESTADISTICAS.TECNICOS_TOP, { params: { limite } })
      .then((r) => r.data),
};
