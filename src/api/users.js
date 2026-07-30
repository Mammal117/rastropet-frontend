import client, { extractErrorMessage } from './client';

// Usada por dueños (para invitar voluntarios) y admins (para crear
// voluntarios o nuevos admins) desde el modal "Registrar usuario".
// Qué rol está permitido según quién la llama lo valida el backend
// (StoreUserRequest), esto solo hace la petición.
export async function createUser(payload) {
  try {
    const res = await client.post('/users', payload);
    return res.data.data ?? res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}
