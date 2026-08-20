/**
 * Tipos de datos para usuarios
 * Los datos ahora vienen de la API (/api/usuarios en el backend)
 */

export type UserRole = "admin" | "tecnico" | "administrativo";

export type Permission =
  | "view-estadisticas"
  | "view-registro-reportes"
  | "view-busqueda-reportes"
  | "view-gestion-registros"
  | "view-gestion-usuarios";

export interface UsuarioData {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
  nombreCompleto?: string;
  email?: string;
}

// Usuarios mock eliminados - ahora los datos vienen del backend via API
export const USUARIOS_REGISTRADOS: UsuarioData[] = [];

export function findUsuario(_username: string): UsuarioData | undefined {
  return undefined;
}
