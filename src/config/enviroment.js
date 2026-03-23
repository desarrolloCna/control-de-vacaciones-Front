/* Ambientes */
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
