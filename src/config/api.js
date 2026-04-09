import axios from 'axios';
import { API_URL } from './enviroment';

const api = axios.create({
  baseURL: `${API_URL}`, // URL base para todas las solicitudes
  headers: {
    'Content-Type': 'application/json', // Encabezado predeterminado
    // Puedes agregar otros encabezados aquí
  }
});

// Interceptor para agregar token JWT en las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

// Interceptor de respuesta: manejo diferenciado de errores HTTP
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401 = Token expirado o inválido → redirigir al login
    if (status === 401) {
      const isLoginPage = window.location.pathname === '/' || window.location.pathname === '/login';
      if (!isLoginPage) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/?expired=1';
      }
    }

    // 403 = Sin permisos → NO redirigir, solo loguear (el componente maneja el error)
    if (status === 403) {
      console.warn('[API] Acceso denegado (403):', error.response?.data?.message || 'Sin permisos para esta acción.');
    }

    // 409 = Conflicto → Operación normal, no es un error fatal
    if (status === 409) {
      console.warn('[API] Conflicto (409):', error.response?.data?.message || 'Conflicto en la solicitud.');
    }

    return Promise.reject(error);
  }
);
