import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Tipos de roles y permisos para el sistema
 */
export type UserRole = "admin" | "tecnico" | "administrativo";

export type Permission =
  | "view-estadisticas"
  | "view-registro-reportes"
  | "view-busqueda-reportes"
  | "view-gestion-registros"
  | "view-gestion-usuarios";

export interface User {
  id: number;
  username: string;
  nombre_completo: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (perm: Permission) => boolean;
  hasAnyPermission: (perms: Permission[]) => boolean;
  userPermissions: Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "sigret_token";
const USER_KEY = "sigret_user";

const DB_ROLE_TO_FRONTEND: Record<string, UserRole> = {
  admin: "admin",
  tecnico: "tecnico",
  administrativo: "administrativo",
};

function getStoredUser(): User | null {
  try {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch {
    // Ignorar errores de parsing
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3001/api"
        }/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_usuario: email,
            contraseña: password,
          }),
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // Guardar token JWT
      sessionStorage.setItem(TOKEN_KEY, data.token);

      // Mapear datos del backend al frontend
      const rolNombre = (data.usuario.rol?.nombre || "tecnico").toLowerCase();
      const userRole: UserRole = DB_ROLE_TO_FRONTEND[rolNombre] || "tecnico";

      // Mapear permisos del backend a permisos del frontend
      const permisosBackend = data.usuario.permisos || [];

      const VALID_PERMISSIONS: Permission[] = [
        "view-estadisticas",
        "view-registro-reportes",
        "view-busqueda-reportes",
        "view-gestion-registros",
        "view-gestion-usuarios",
      ];

      const permisosFrontend: Permission[] = permisosBackend
        .map((p: { nombre: string }) => {
          const nombre = p.nombre;
          if (VALID_PERMISSIONS.includes(nombre as Permission)) {
            return nombre as Permission;
          }
          // Compatibilidad con permisos antiguos
          const permMap: Record<string, Permission> = {
            ver_usuarios: "view-gestion-usuarios",
            crear_usuarios: "view-gestion-usuarios",
            editar_usuarios: "view-gestion-usuarios",
          };
          return permMap[nombre] || null;
        })
        .filter(Boolean);

      // Agregar permisos por defecto según el rol
      if (userRole === "admin") {
        if (!permisosFrontend.includes("view-estadisticas"))
          permisosFrontend.push("view-estadisticas");
        if (!permisosFrontend.includes("view-registro-reportes"))
          permisosFrontend.push("view-registro-reportes");
        if (!permisosFrontend.includes("view-busqueda-reportes"))
          permisosFrontend.push("view-busqueda-reportes");
        if (!permisosFrontend.includes("view-gestion-registros"))
          permisosFrontend.push("view-gestion-registros");
        if (!permisosFrontend.includes("view-gestion-usuarios"))
          permisosFrontend.push("view-gestion-usuarios");
      } else if (userRole === "tecnico") {
        if (!permisosFrontend.includes("view-estadisticas"))
          permisosFrontend.push("view-estadisticas");
        if (!permisosFrontend.includes("view-busqueda-reportes"))
          permisosFrontend.push("view-busqueda-reportes");
      } else if (userRole === "administrativo") {
        if (!permisosFrontend.includes("view-estadisticas"))
          permisosFrontend.push("view-estadisticas");
        if (!permisosFrontend.includes("view-registro-reportes"))
          permisosFrontend.push("view-registro-reportes");
        if (!permisosFrontend.includes("view-busqueda-reportes"))
          permisosFrontend.push("view-busqueda-reportes");
        if (!permisosFrontend.includes("view-gestion-registros"))
          permisosFrontend.push("view-gestion-registros");
      }

      const userData: User = {
        id: data.usuario.id,
        username: data.usuario.nombre_usuario,
        nombre_completo: `${data.usuario.nombre_usuario} ${data.usuario.apellido_usuario}`,
        email: data.usuario.email,
        role: userRole,
        permissions: permisosFrontend,
      };

      setUser(userData);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("[AUTH] Error en login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  };

  const hasAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const hasPermission = (perm: Permission): boolean => {
    if (!user) return false;
    return user.permissions.includes(perm);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (!user) return false;
    return perms.some((perm) => user.permissions.includes(perm));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        hasAccess,
        hasPermission,
        hasAnyPermission,
        userPermissions: user?.permissions ?? [],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de un AuthProvider");
  }
  return context;
}