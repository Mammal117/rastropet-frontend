import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Mismos requisitos que el backend (RegisterRequest):
// mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
const HAS_UPPER = /[A-Z]/;
const HAS_NUMBER = /[0-9]/;
const HAS_SYMBOL = /[^A-Za-z0-9]/;

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState('dueño');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  function validate() {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Ingresa tu nombre completo.';
    }

    if (!email.trim()) {
      errors.email = 'Ingresa tu correo.';
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = 'Ese correo no tiene un formato válido.';
    }

    if (phone.trim() && !/^\d{7,15}$/.test(phone.trim())) {
      errors.phone = 'Ingresa solo números (7 a 15 dígitos).';
    }

    if (!password) {
      errors.password = 'Ingresa una contraseña.';
    } else if (password.length < 8) {
      errors.password = 'Debe tener al menos 8 caracteres.';
    } else if (!HAS_UPPER.test(password)) {
      errors.password = 'Debe incluir al menos una mayúscula.';
    } else if (!HAS_NUMBER.test(password)) {
      errors.password = 'Debe incluir al menos un número.';
    } else if (!HAS_SYMBOL.test(password)) {
      errors.password = 'Debe incluir al menos un carácter especial.';
    }

    if (!passwordConfirmation) {
      errors.passwordConfirmation = 'Confirma tu contraseña.';
    } else if (password !== passwordConfirmation) {
      errors.passwordConfirmation = 'Las contraseñas no coinciden.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const success = await register({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
      password_confirmation: passwordConfirmation,
      role,
    });
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
        <h2>Crea tu cuenta</h2>

        {error && <div className="form-error">{error}</div>}

        <form className="login-form-fields" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>

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

          <div className="field">
            <input
              type="tel"
              placeholder="Teléfono (opcional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
          </div>

          <div className="field">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            >
              <option value="dueño">Soy dueño de una mascota</option>
              <option value="voluntario">Quiero ser voluntario</option>
            </select>
          </div>

          <div className="field" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '18px',
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

          <div className="field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirma tu contraseña"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
            />
            {fieldErrors.passwordConfirmation && (
              <div className="field-error">{fieldErrors.passwordConfirmation}</div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" style={{ color: '#ff7a00', fontWeight: '600', textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}