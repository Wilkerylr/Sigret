import { createContext, useContext, useState, type ReactNode } from "react";
import { findUsuario } from "@/componentes/login/contexto/usuarios";
import type { UserRole, Permission } from "@/componentes/login/contexto/usuarios";

export type { UserRole, Permission };

export interface User {
  username: string;
  role: UserRole;
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
  hasPermission: (perm: Permission) => boolean;
  hasAnyPermission: (perms: Permission[]) => boolean;
  userPermissions: Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = "sigret_user";

function getStoredUser(): User | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as User;
  } catch {
    // Ignorar errores de parsing
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const foundUser = findUsuario(username);
      if (foundUser && foundUser.password === password) {
        const userData: User = {
          username: foundUser.username,
          role: foundUser.role,
          permissions: foundUser.permissions,
        };
        setUser(userData);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userData));
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
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