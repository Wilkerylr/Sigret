/* ======================================
   types/index.ts — Tipos específicos para Gestión de Usuarios
   ====================================== */

/** Roles de usuario */
export type UserRole = "admin" | "tecnico" | "administrativo";

/** Permisos disponibles en el sistema */
export type Permission =
  | "view-estadisticas"
  | "view-registro-reportes"
  | "view-busqueda-reportes"
  | "view-gestion-registros"
  | "view-gestion-usuarios";

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