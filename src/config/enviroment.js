/* Ambientes */
const rawUrl = import.meta.env.MODE === 'development' ? "http://localhost:3000/api" : "https://control-de-vacaciones-api-kappa.vercel.app/api";
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
