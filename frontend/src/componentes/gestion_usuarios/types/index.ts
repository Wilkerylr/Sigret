/* ======================================
   types/index.ts — Tipos específicos para Gestión de Usuarios
   ====================================== */

import type { Permission, UserRole } from '@/types';

/** Roles y permisos: definición única en src/types */
export type { Permission, UserRole } from '@/types';

/** Filtros para la tabla de usuarios */
export interface FiltrosUsuarios {
  username: string;
  role: UserRole | '';
  nombreCompleto: string;
}

/** Datos extendidos para formulario de usuario (incluye password) */
export interface UsuarioFormData {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
  nombreCompleto: string;
  email: string;
}