import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Ingresa tu correo.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Ese correo no tiene un formato valido.';
    }
    if (!password.trim()) {
      errors.password = 'Ingresa tu contraseña.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const success = await login(email.trim(), password);
    setSubmitting(false);
    if (success) navigate('/dashboard');
  }

  return (
    <div className="login-screen">
      <div className="login-brand">
        <div className="login-brand-overlay">
          <h1>RASTROPET</h1>
          <p>Cada minuto cuenta.<br />Encuentra a tu mascota mas rapido.</p>
        </div>
      </div>

      <div className="login-form-wrap">
        <h2>Bienvenido de nuevo</h2>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form-fields" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
          </div>

          <div className="field" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                padding: 0,
                color: '#666'
              }}
              title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%' }}>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          <span style={{ padding: '0 10px', color: '#888', fontSize: '14px' }}>o</span>
          <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#ddd' }}></div>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.replace('https://2.24.78.20.nip.io/auth/google');
          }}
          className="btn-google"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#333'
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" style={{ color: '#ff7a00', fontWeight: '600', textDecoration: 'none' }}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}