import { logError } from '@/lib/logger';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Roles y permisos: definición única en src/types.
 * Se re-exportan para no romper imports existentes.
 */
import type { Permission, UserRole } from "@/types";

export type { Permission, UserRole } from "@/types";

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
  refreshPermissions: () => Promise<void>;
  isLoading: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (perm: Permission) => boolean;
  hasAnyPermission: (perms: Permission[]) => boolean;
  userPermissions: Permission[];
  primerLogin: boolean;
  setPrimerLogin: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "sigret_token";
const USER_KEY = "sigret_user";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/** Margen antes de la expiración para renovar el token de forma proactiva. */
const MARGEN_REFRESCO_MS = 2 * 60 * 1000;

const DB_ROLE_TO_FRONTEND: Record<string, UserRole> = {
  admin: "admin",
  tecnico: "tecnico",
  administrativo: "administrativo",
};

const VALID_PERMISSIONS: Permission[] = [
  "view-estadisticas",
  "view-registro-reportes",
  "view-busqueda-reportes",
  "view-gestion-registros",
  "view-gestion-usuarios",
];

const PERMISOS_POR_ROL: Record<UserRole, Permission[]> = {
  admin: [
    "view-estadisticas",
    "view-registro-reportes",
    "view-busqueda-reportes",
    "view-gestion-registros",
    "view-gestion-usuarios",
  ],
  tecnico: ["view-estadisticas", "view-busqueda-reportes"],
  administrativo: [
    "view-estadisticas",
    "view-registro-reportes",
    "view-busqueda-reportes",
    "view-gestion-registros",
  ],
};

interface UsuarioBackend {
  id: number;
  nombre_usuario: string;
  apellido_usuario?: string | null;
  email: string;
  rol?: { id: number; nombre: string | null } | null;
  permisos?: Array<{ nombre: string }>;
}

function getStoredUser(): User | null {
  try {
    const stored = sessionStorage.getItem(USER_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch {
    // Ignorar errores de parsing
  }
  return null;
}

/**
 * Decodifica la fecha de expiración (`exp`) de un JWT sin verificar la firma.
 * El backend sigue siendo la única autoridad de validación.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(base64 + padding));
    return typeof json.exp === "number" ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

function mapearPermisos(
  permisosBackend: Array<{ nombre: string }>,
  userRole: UserRole
): Permission[] {
  const permisosFrontend = permisosBackend
    .map((p) => {
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
    .filter((permiso): permiso is Permission => permiso !== null);

  // Agregar permisos por defecto según el rol
  for (const permiso of PERMISOS_POR_ROL[userRole]) {
    if (!permisosFrontend.includes(permiso)) {
      permisosFrontend.push(permiso);
    }
  }

  return permisosFrontend;
}

function construirUsuario(usuarioBackend: UsuarioBackend): User {
  const rolNombre = (usuarioBackend.rol?.nombre || "tecnico").toLowerCase();
  const userRole: UserRole = DB_ROLE_TO_FRONTEND[rolNombre] || "tecnico";

  return {
    id: usuarioBackend.id,
    username: usuarioBackend.nombre_usuario,
    nombre_completo: `${usuarioBackend.nombre_usuario} ${
      usuarioBackend.apellido_usuario || ""
    }`.trim(),
    email: usuarioBackend.email,
    role: userRole,
    permissions: mapearPermisos(usuarioBackend.permisos || [], userRole),
  };
}

/** Redirige al login mostrando el aviso de sesión expirada. */
function redirigirSesionExpirada() {
  if (
    window.location.pathname === "/" &&
    window.location.search.includes("sesion=expirada")
  ) {
    return;
  }
  window.location.href = "/?sesion=expirada";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);
  const [primerLogin, setPrimerLogin] = useState(false);
  const [tokenExpiraEn, setTokenExpiraEn] = useState<number | null>(() => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    return token ? getTokenExpiry(token) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_usuario: email,
          contraseña: password,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      const userData = construirUsuario(data.usuario);

      // Guardar token JWT y programar su renovación
      sessionStorage.setItem(TOKEN_KEY, data.token);
      setTokenExpiraEn(getTokenExpiry(data.token));

      setUser(userData);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));

      const esPrimerLogin = data.primer_login === true;
      // ─── Log de depuración: ver si el backend indica primer login ───
      console.log('[AUTH] Resultado del login:', {
        primerLoginDesdeBackend: data.primer_login,
        esPrimerLogin,
        usuarioId: data.usuario?.id,
        usuarioNombre: data.usuario?.nombre_usuario,
      });
      setPrimerLogin(esPrimerLogin);
      return true;
    } catch (error) {
      logError("[AUTH] Error en login:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setTokenExpiraEn(null);
    setPrimerLogin(false);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }, []);

  /**
   * Renueva el token antes de que expire (refresco deslizante).
   * Si el backend rechaza el token, cierra la sesión y avisa al usuario.
   */
  const refrescarToken = useCallback(async (): Promise<boolean> => {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          logout();
          redirigirSesionExpirada();
        }
        return false;
      }

      const data = await response.json();
      const userData = construirUsuario(data.usuario);

      sessionStorage.setItem(TOKEN_KEY, data.token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      setTokenExpiraEn(getTokenExpiry(data.token));
      return true;
    } catch (error) {
      logError("[AUTH] Error al refrescar el token:", error);
      return false;
    }
  }, [logout]);

  // Programa la renovación un par de minutos antes de que expire el token.
  useEffect(() => {
    if (!user || !tokenExpiraEn) return;

    const restante = tokenExpiraEn - Date.now() - MARGEN_REFRESCO_MS;
    // Si ya está dentro del margen, espera unos segundos para no repetir
    // peticiones en bucle si el reloj del cliente está desfasado.
    const espera = restante > 0 ? restante : 5000;

    const temporizador = window.setTimeout(() => {
      void refrescarToken();
    }, espera);

    return () => window.clearTimeout(temporizador);
  }, [user, tokenExpiraEn, refrescarToken]);

  const refreshPermissions = async () => {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const response = await fetch(`${API_URL}/auth/refresh-permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const data = await response.json();
      const userData = construirUsuario(data.usuario);

      sessionStorage.setItem(TOKEN_KEY, data.token);
      setTokenExpiraEn(getTokenExpiry(data.token));
      setUser(userData);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      logError("[AUTH] Error al refrescar permisos:", error);
    }
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
        refreshPermissions,
        isLoading,
        hasAccess,
        hasPermission,
        hasAnyPermission,
        userPermissions: user?.permissions ?? [],
        primerLogin,
        setPrimerLogin,
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