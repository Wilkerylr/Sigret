/**
 * Tipos para autenticación y autorización
 */
export type UserRole = 'admin' | 'tecnico' | 'administrativo';

export type Permission =
  | 'view-estadisticas'
  | 'view-registro-reportes'
  | 'view-busqueda-reportes'
  | 'view-gestion-registros'
  | 'view-gestion-usuarios';

export interface User {
  username: string;
  role: UserRole;
  permissions: Permission[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}