import axios from 'axios';

// URL base de tu backend Laravel. Se lee de la variable de entorno
// VITE_API_URL (definida en el archivo .env). Si no existe, usa el
// valor por defecto de "php artisan serve" en local.
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
});

// Token guardado en memoria + localStorage para que la sesión
// sobreviva a un refresh de la página (F5).
let authToken = localStorage.getItem('rastropet_token') || null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('rastropet_token', token);
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('rastropet_token');
    delete client.defaults.headers.common.Authorization;
  }
}

// Al cargar la app, si ya había un token guardado, lo volvemos a mandar
// en cada request sin que el usuario tenga que loguearse de nuevo.
if (authToken) {
  client.defaults.headers.common.Authorization = `Bearer ${authToken}`;
}

export function getAuthToken() {
  return authToken;
}

// Convierte los errores de axios/Laravel (422 de validación, 401, etc.)
// en un mensaje de texto simple para mostrar en el formulario.
export function extractErrorMessage(err) {
  if (!err.response) {
    return 'No se pudo conectar con el servidor. Revisa que el backend esté corriendo.';
  }
  const { status, data } = err.response;
  if (status === 422 && data?.errors) {
    return Object.values(data.errors).flat().join(' ');
  }
  if (status === 401) {
    return 'Correo o contraseña incorrectos.';
  }
  return data?.message || 'Ocurrió un error. Intenta de nuevo.';
}

export default client;
