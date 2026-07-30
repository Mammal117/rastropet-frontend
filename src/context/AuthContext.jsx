import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginRequest, logout as logoutRequest, fetchMe, register as registerRequest } from '../api/auth';
import { getAuthToken, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  // Si ya habia un token guardado (de una sesion anterior), intentamos
  // recuperar el usuario con /me para no pedirle login de nuevo.
  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken();
      if (!token) {
        setCheckingSession(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUser(me);
      } catch {
        // token invalido o expirado, se queda deslogueado
      } finally {
        setCheckingSession(false);
      }
    }
    restoreSession();
  }, []);

  async function login(email, password) {
    setError('');
    try {
      const data = await loginRequest(email, password);
      setUser(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  // El registro, si sale bien, ya deja al usuario logueado (el backend
  // devuelve token + user igual que en login), por eso reutilizamos el
  // mismo patrón: guardamos el usuario y quien llame a register() ya
  // puede navegar directo al dashboard.
  async function register(payload) {
    setError('');
    try {
      const data = await registerRequest(payload);
      setUser(data);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  // Se usa desde la página que atiende /auth/google/callback: el backend ya
  // generó el token de Sanctum y lo mandó en la URL, aquí solo lo guardamos
  // y recuperamos el usuario con /auth/me, igual que si hubiera hecho login normal.
  async function loginWithGoogleToken(token) {
    setError('');
    try {
      setAuthToken(token);
      const me = await fetchMe();
      setUser(me);
      return true;
    } catch (err) {
      setAuthToken(null);
      setError('No se pudo completar el inicio de sesión con Google.');
      return false;
    }
  }

  const value = { user, login, logout, register, loginWithGoogleToken, error, checkingSession };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
