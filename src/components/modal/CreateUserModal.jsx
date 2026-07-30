import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createUser } from '../../api/users';

// Mismas reglas de contraseña que usa el backend (StoreUserRequest / RegisterRequest).
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function CreateUserModal({ onCancel }) {
  const { user } = useAuth();
  const esAdmin = user?.role?.name === 'admin';

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'voluntario',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!values.name.trim() || !values.email.trim()) {
      setError('El nombre y el correo son obligatorios.');
      return;
    }
    if (!PASSWORD_REGEX.test(values.password)) {
      setError('La contraseña debe tener 8+ caracteres, mayúscula, minúscula, número y símbolo.');
      return;
    }
    if (values.password !== values.password_confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const nuevo = await createUser(values);
      setSuccess(`Cuenta de ${nuevo.name} creada como ${nuevo.role}.`);
      setValues({
        name: '', email: '', phone: '', role: 'voluntario', password: '', password_confirmation: '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Registrar nuevo usuario</h3>
        <p>
          {esAdmin
            ? 'Puedes crear cuentas de voluntario o de administrador.'
            : 'Puedes invitar cuentas de voluntario para que te ayuden a buscar a tu mascota.'}
        </p>

        {error && <p style={{ color: '#C23030', fontSize: 13 }}>{error}</p>}
        {success && <p style={{ color: '#1F8A50', fontSize: 13 }}>{success}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="nu-name">Nombre completo</label>
            <input
              id="nu-name"
              value={values.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="nu-email">Correo</label>
            <input
              id="nu-email"
              type="email"
              value={values.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="nu-phone">Teléfono (opcional)</label>
            <input
              id="nu-phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          {/* Un dueño solo puede invitar voluntarios, así que ni se le
              muestra la opción de elegir rol — siempre se manda "voluntario".
              Un admin sí puede elegir entre voluntario o admin. */}
          {esAdmin && (
            <div className="modal-field">
              <label htmlFor="nu-role">Rol</label>
              <select id="nu-role" value={values.role} onChange={(e) => handleChange('role', e.target.value)}>
                <option value="voluntario">Voluntario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          <div className="modal-field">
            <label htmlFor="nu-password">Contraseña temporal</label>
            <input
              id="nu-password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="nu-password-confirm">Confirmar contraseña</label>
            <input
              id="nu-password-confirm"
              type="password"
              value={values.password_confirmation}
              onChange={(e) => handleChange('password_confirmation', e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cerrar</button>
            <button type="submit" className="btn-accent-sm" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
