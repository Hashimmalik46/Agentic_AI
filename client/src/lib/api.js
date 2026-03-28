// In dev, Vite proxy handles /generate-leads → localhost:5000
// In production, VITE_API_URL points to the Render backend
const BASE = import.meta.env.VITE_API_URL || '';

export const api = (path, options) => fetch(`${BASE}${path}`, options);
