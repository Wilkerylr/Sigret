/**
 * Hook personalizado para gestionar reportes con React Query
 * Proporciona estados de carga, error y datos para los componentes
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportesService } from '@/services/reportes.service';
import type { QueryParams } from '@/api/types';
import type { CreateReporteRequest, UpdateReporteRequest } from '@/types/reporte.types';

const REPORTES_KEY = 'reportes';

export function useReportes(params?: QueryParams) {
  return useQuery({
    queryKey: [REPORTES_KEY, params],
    queryFn: () => reportesService.getAll(params),
    select: (res) => res.data,
  });
}

export function useReporte(id: string) {
  return useQuery({
    queryKey: [REPORTES_KEY, id],
    queryFn: () => reportesService.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCrearReporte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateReporteRequest) => reportesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTES_KEY] });
    },
  });
}

export function useActualizarReporte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReporteRequest }) =>
      reportesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTES_KEY] });
    },
  });
}

export function useEliminarReporte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORTES_KEY] });
    },
  });
}