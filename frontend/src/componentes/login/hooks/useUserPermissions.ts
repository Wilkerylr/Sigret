import { useState, useEffect } from "react";
import {
  type UsuarioData,
  type Permission,
  USUARIOS_REGISTRADOS,
  findUsuario,
} from "../contexto/usuarios";

export interface UserPermissionsResult {
  usuario: UsuarioData | null;
  permissions: Permission[];
  hasPermission: (perm: Permission) => boolean;
  hasAllPermissions: (perms: Permission[]) => boolean;
  hasAnyPermission: (perms: Permission[]) => boolean;
  isLoading: boolean;
  error: string | null;
  getAllUsers: () => UsuarioData[];
  refreshUser: (username: string) => void;
}

export function useUserPermissions(username: string | null): UserPermissionsResult {
  const [usuario, setUsuario] = useState<UsuarioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = (userName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const found = findUsuario(userName);

      if (!found) {
        setError(`Usuario "${userName}" no encontrado`);
        setUsuario(null);
      } else {
        setUsuario(found);
      }
    } catch {
      setError("Error al obtener datos del usuario");
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      refreshUser(username);
    } else {
      setUsuario(null);
      setError(null);
      setIsLoading(false);
    }
  }, [username]);

  const permissions = usuario?.permissions ?? [];

  const hasPermission = (perm: Permission): boolean => permissions.includes(perm);
  const hasAllPermissions = (perms: Permission[]): boolean => perms.every((perm) => permissions.includes(perm));
  const hasAnyPermission = (perms: Permission[]): boolean => perms.some((perm) => permissions.includes(perm));
  const getAllUsers = (): UsuarioData[] => USUARIOS_REGISTRADOS;

  return {
    usuario,
    permissions,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    isLoading,
    error,
    getAllUsers,
    refreshUser,
  };
}