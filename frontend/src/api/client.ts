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
    if (error.response?.status === 401) {
      // Token expirado o inválido → cerrar sesión
      sessionStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;