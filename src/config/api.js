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

// Interceptor de respuesta: detecta sesión expirada (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      // Evitar bucle si ya estamos en login
      if (!window.location.pathname.includes('/') || window.location.pathname !== '/') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '/?expired=1';
      }
    }
    return Promise.reject(error);
  }
);
