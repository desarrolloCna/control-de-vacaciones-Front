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
