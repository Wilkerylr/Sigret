/**
 * Datos de usuarios simulados (reemplazará la llamada a la API /api/usuarios)
 * Reubicado desde login/contexto/usuarios.ts
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

// Base de datos local que se reemplazará por API
export const USUARIOS_REGISTRADOS: UsuarioData[] = [
  {
    id: "USR-001",
    username: "admin",
    password: "password",
    role: "admin",
    permissions: [
      "view-estadisticas",
      "view-registro-reportes",
      "view-busqueda-reportes",
      "view-gestion-registros",
      "view-gestion-usuarios",
    ],
    nombreCompleto: "Administrador del Sistema",
    email: "admin@sistema.com",
  },
  {
    id: "USR-002",
    username: "tecnico",
    password: "tecnico123",
    role: "tecnico",
    permissions: ["view-estadisticas", "view-busqueda-reportes"],
    nombreCompleto: "Técnico de Campo",
    email: "tecnico@sistema.com",
  },
  {
    id: "USR-003",
    username: "administrativo",
    password: "admin123",
    role: "administrativo",
    permissions: [
      "view-estadisticas",
      "view-registro-reportes",
      "view-busqueda-reportes",
      "view-gestion-registros",
    ],
    nombreCompleto: "Personal Administrativo",
    email: "administrativo@sistema.com",
  },
];

export function findUsuario(username: string): UsuarioData | undefined {
  return USUARIOS_REGISTRADOS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}