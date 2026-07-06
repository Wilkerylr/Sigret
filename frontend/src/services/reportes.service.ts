/**
 * Servicio de Reportes
 * Gestiona todas las peticiones HTTP relacionadas con reportes técnicos
 */
import apiClient from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@/api/types';
import type { ReporteResumen, CreateReporteRequest, UpdateReporteRequest } from '@/types/reporte.types';

export const reportesService = {
  /** Obtener listado paginado de reportes */
  getAll: (params?: QueryParams) =>
    apiClient.get<PaginatedResponse<ReporteResumen>>(ENDPOINTS.REPORTES.BASE, { params }),

  /** Obtener reporte por ID */
  getById: (id: string) =>
    apiClient.get<ApiResponse<ReporteResumen>>(ENDPOINTS.REPORTES.BY_ID(id)),

  /** Crear nuevo reporte */
  create: (data: CreateReporteRequest) =>
    apiClient.post<ApiResponse<ReporteResumen>>(ENDPOINTS.REPORTES.BASE, data),

  /** Actualizar reporte existente */
  update: (id: string, data: UpdateReporteRequest) =>
    apiClient.put<ApiResponse<ReporteResumen>>(ENDPOINTS.REPORTES.BY_ID(id), data),

  /** Eliminar reporte */
  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(ENDPOINTS.REPORTES.BY_ID(id)),
};