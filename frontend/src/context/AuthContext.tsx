import { createContext, useContext, useState, type ReactNode } from "react";

export type UserRole = "admin" | "tecnico" | "administrativo";

export interface User {
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios hardcodeados (reemplazar con API)
const VALID_USERS: Record<string, { password: string; role: UserRole }> = {
  admin: { password: "password", role: "admin" },
  tecnico: { password: "tecnico123", role: "tecnico" },
  administrativo: { password: "admin123", role: "administrativo" },
};

const SESSION_STORAGE_KEY = "sigret_user";

function getStoredUser(): User | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as User;
    }
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
      // Simular delay de conexión
      await new Promise((resolve) => setTimeout(resolve, 800));

      const foundUser = VALID_USERS[username];
      if (foundUser && foundUser.password === password) {
        const userData: User = { username, role: foundUser.role };
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

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess }}>
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