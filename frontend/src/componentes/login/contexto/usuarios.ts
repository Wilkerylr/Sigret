export type UserRole = "admin" | "tecnico" | "administrativo";

export type Permission =
  | "view-estadisticas"
  | "view-registro-reportes"
  | "view-busqueda-reportes"
  | "view-gestion-registros"
  | "view-gestion-usuarios";

export interface UsuarioData {
  username: string;
  password: string;
  role: UserRole;
  permissions: Permission[];
}

// Base de datos local que se reemplazará por API
export const USUARIOS_REGISTRADOS: UsuarioData[] = [
  {
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
  },
  {
    username: "tecnico",
    password: "tecnico123",
    role: "tecnico",
    permissions: ["view-estadisticas", "view-busqueda-reportes"],
  },
  {
    username: "administrativo",
    password: "admin123",
    role: "administrativo",
    permissions: [
      "view-estadisticas",
      "view-registro-reportes",
      "view-busqueda-reportes",
      "view-gestion-registros",
    ],
  },
];

export function findUsuario(username: string): UsuarioData | undefined {
  return USUARIOS_REGISTRADOS.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}