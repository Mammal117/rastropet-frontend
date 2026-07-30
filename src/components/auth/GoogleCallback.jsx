import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// A esta pantalla regresa el navegador después de /auth/google/callback en
// el backend, con el token de Sanctum pegado en la URL (?token=...). Aquí
// no hay nada que mostrarle al usuario más que un mensaje breve: en cuanto
// se guarda el token, se le manda directo al dashboard.
export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogleToken } = useAuth();
  const yaProcesado = useRef(false);

  useEffect(() => {
    if (yaProcesado.current) return;
    yaProcesado.current = true;

    async function procesar() {
      const token = searchParams.get('token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      const success = await loginWithGoogleToken(token);
      navigate(success ? '/dashboard' : '/login', { replace: true });
    }

    procesar();
  }, [searchParams, navigate, loginWithGoogleToken]);

  return <div className="state-message">Completando inicio de sesión con Google...</div>;
}
