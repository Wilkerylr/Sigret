import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import type { UserRole, Permission } from "@/types";
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
  const {
    user,
    hasAccess,
    hasPermission,
    hasAnyPermission,
    primerLogin,
  } = useAuthContext();
  const location = useLocation();
  const enPrimerLogin = location.pathname === "/primer-login";

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // El formulario de primer login solo requiere estar autenticado.
  if (enPrimerLogin) {
    return <>{children}</>;
  }

  // Mientras el primer login esté pendiente, no se puede acceder al resto de la app.
  if (primerLogin) {
    return <Navigate to="/primer-login" replace />;
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