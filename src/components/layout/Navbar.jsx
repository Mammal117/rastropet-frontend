import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreateUserModal from '../modal/CreateUserModal';

export default function Navbar({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showCreateUser, setShowCreateUser] = useState(false);

  const puedeRegistrarUsuarios = user?.role?.name === 'dueño' || user?.role?.name === 'admin';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Ajusta estos campos al nombre real que use tu modelo de Usuario en Laravel
  // (por ejemplo "name" en vez de "firstName", o "nombre"/"apellido" si los separaste).
  const displayName = user?.name || user?.nombre || user?.email || 'Usuario';
 const roleLabel = user?.role?.name || user?.rol || user?.email || '';
  const iniciales = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="navbar">
      <div className="page-title">{title}</div>

      <div className="navbar-right">
        {puedeRegistrarUsuarios && (
          <button type="button" className="btn-accent-sm" onClick={() => setShowCreateUser(true)}>
            Registrar usuario
          </button>
        )}

        <div className="user-chip">
          <div className="avatar-fallback">{iniciales || '?'}</div>
          <div>
            <div className="name">{displayName}</div>
            <div className="role">{roleLabel}</div>
          </div>
        </div>

        <button type="button" className="btn-logout" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </div>

      {showCreateUser && <CreateUserModal onCancel={() => setShowCreateUser(false)} />}
    </div>
  );
}
