import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook personalizado para manejar la autenticación.
 * Encapsula la lógica de login y la gestión de estados (loading, error).
 * 
 * @returns {Object} Métodos y estado del formulario de autenticación.
 */
export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    /**
     * Valida las credenciales del usuario.
     * @param {string} username - Nombre de usuario
     * @param {string} password - Contraseña
     * @returns {Promise<boolean>} Resultado de la autenticación
     */
    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);

        try {
            // Simular delay de conexión
            await new Promise(resolve => setTimeout(resolve, 800));

            // TODO: Reemplazar con llamada a API real
            // Endpoint: POST /api/auth/login
            const isValid = username === "admin" && password === "password";

            if (isValid) {
                navigate("/home");
                return true;
            }

            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
    };
}