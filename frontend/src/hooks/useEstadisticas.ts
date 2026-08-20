import { useQuery } from '@tanstack/react-query';
import { estadisticasService } from '@/services/estadisticas.service';

export const ESTADISTICAS_KEY = 'estadisticas';

export function useEstadisticas() {
  return useQuery({
    queryKey: [ESTADISTICAS_KEY, 'dashboard'],
    queryFn: () => estadisticasService.getDashboard(),
    staleTime: 5 * 60 * 1000,
  });
}
