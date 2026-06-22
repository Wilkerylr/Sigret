import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import type { UserRole, Permission } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  requireAllPermissions?: boolean;
  children: ReactNode;
}

/**
 * Protege rutas por roles y/o permisos individuales.
 * Si se especifican ambos (allowedRoles + requiredPermissions), se requiere cumplir ambas condiciones.
 */
export function ProtectedRoute({
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = true,
  children,
}: ProtectedRouteProps) {
  const { user, hasAccess, hasPermission, hasAnyPermission } = useAuthContext();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasAccess(allowedRoles)) {
    return <Navigate to="/home" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequired = requireAllPermissions
      ? requiredPermissions.every((perm) => hasPermission(perm))
      : hasAnyPermission(requiredPermissions);

    if (!hasRequired) {
      return <Navigate to="/home" replace />;
    }
  }

  return <>{children}</>;
}