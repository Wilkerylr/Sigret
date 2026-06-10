import { Navigate } from "react-router-dom";
import { useAuthContext, type UserRole } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuthContext();

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario no tiene el rol requerido, redirigir al inicio
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}