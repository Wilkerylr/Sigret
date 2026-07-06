/**
 * Tipos genéricos para respuestas de API
 * Define contratos estándar para todas las comunicaciones HTTP
 */

/** Respuesta exitosa genérica */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/** Respuesta paginada */
export interface PaginatedResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

/** Respuesta de error */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
  timestamp: string;
}

/** Parámetros de consulta para listados paginados */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | undefined;
}