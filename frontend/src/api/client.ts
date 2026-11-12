/**
 * Cliente HTTP centralizado con Axios
 * Configura interceptors para autenticación JWT y manejo global de errores
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para adjuntar token JWT en cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sigret_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejo global de errores HTTP
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? '';

    // Los errores 401 de estos endpoints son de credenciales, no de sesión:
    // no deben cerrar la sesión ni redirigir al login.
    const esErrorDeCredenciales = [
      '/auth/login',
      '/auth/cambiar-password',
      '/auth/recuperar-password',
      '/auth/verificar-preguntas',
    ].some((ruta) => url.includes(ruta));

    if (status === 401 && !esErrorDeCredenciales) {
      // Token expirado o inválido → cerrar sesión y avisar en el login.
      sessionStorage.clear();
      if (!window.location.search.includes('sesion=expirada')) {
        window.location.href = '/?sesion=expirada';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;