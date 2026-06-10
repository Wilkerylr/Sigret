/**
 * Hook personalizado para manejar la autenticación.
 * Encapsula la lógica de login y la gestión de estados (loading, error).
 * 
 * @returns {Object} Métodos y estado del formulario de autenticación.
 */
export { useAuthContext as useAuth } from "@/context/AuthContext";