/**
 * Tipos para el módulo de Usuarios
 */
export interface Usuario {
  id: string;
  username: string;
  nombreCompleto?: string;
  email?: string;
  role: 'admin' | 'tecnico' | 'administrativo';
  permissions: string[];
  activo: boolean;
  createdAt?: string;
}

export interface CreateUsuarioRequest {
  username: string;
  password: string;
  nombreCompleto?: string;
  email?: string;
  role: string;
  permissions?: string[];
}

export interface UpdateUsuarioRequest {
  nombreCompleto?: string;
  email?: string;
  role?: string;
  permissions?: string[];
}