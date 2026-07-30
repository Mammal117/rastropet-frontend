import client, { setAuthToken, extractErrorMessage } from './client';

// Rutas reales de tu backend (routes/api.php), todas bajo el prefijo /auth.

export async function login(email, password) {
  try {
    const res = await client.post('/auth/login', { email, password });
    const token = res.data.token || res.data.access_token || res.data.data?.token;
    const user = res.data.user || res.data.data?.user || res.data;

    if (!token) {
      throw new Error('El backend no devolvio un token. Revisa la respuesta de /auth/login.');
    }

    setAuthToken(token);
    return user;
  } catch (err) {
    if (err.response) throw new Error(extractErrorMessage(err));
    throw err;
  }
}

export async function logout() {
  try {
    await client.post('/auth/logout');
  } catch {
    // Si el token ya expiro o hay error de red, igual limpiamos la sesion local.
  } finally {
    setAuthToken(null);
  }
}

export async function fetchMe() {
  const res = await client.get('/auth/me');
  return res.data.user || res.data.data || res.data;
}

export async function register(payload) {
  try {
    const res = await client.post('/auth/register', payload);
    const { token, user } = res.data;

    if (!token) {
      throw new Error('El backend no devolvió un token. Revisa la respuesta de /auth/register.');
    }

    setAuthToken(token);
    return user;
  } catch (err) {
    if (err.response) throw new Error(extractErrorMessage(err));
    throw err;
  }
}