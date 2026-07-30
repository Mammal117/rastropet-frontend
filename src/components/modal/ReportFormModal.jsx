import { useEffect, useState } from 'react';
import { fetchZonas } from '../../api/reports';
import { useAuth } from '../../context/AuthContext';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Otro'];
const ESTADOS = ['Perdido', 'Encontrado'];

export default function ReportFormModal({ initialValue, onSave, onCancel }) {
  const { user } = useAuth();
  const [zonas, setZonas] = useState([]);
  const [values, setValues] = useState(initialValue ? {
    mascota: initialValue.mascota,
    especie: initialValue.especie,
    estado: initialValue.estado,
    zona_id: initialValue.zona?.id ?? '',
    fecha_perdida: initialValue.fecha_perdida,
    telefono_contacto: initialValue.telefono_contacto ?? '',
    nombre_dueno: initialValue.nombre_dueno ?? '',
    email_contacto: initialValue.email_contacto ?? '',
  } : {
    mascota: '',
    especie: 'Perro',
    estado: 'Perdido',
    zona_id: '',
    fecha_perdida: new Date().toISOString().slice(0, 10),
    telefono_contacto: user?.phone ?? '',
    // Se precargan con los datos de quien tiene la sesión abierta, pero son editables:
    // un admin o voluntario puede reportar a nombre de otra persona y cambiarlos aquí.
    nombre_dueno: user?.name ?? '',
    email_contacto: user?.email ?? '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchZonas().then((data) => {
      setZonas(data);
      setValues((prev) => (prev.zona_id ? prev : { ...prev, zona_id: data[0]?.id ?? '' }));
    }).catch(() => setZonas([]));
  }, []);

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!values.mascota.trim() || !values.zona_id) {
      setError('El nombre de la mascota y la zona son obligatorios.');
      return;
    }
    if (!values.nombre_dueno.trim()) {
      setError('El nombre del dueño de la mascota es obligatorio.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(values.email_contacto)) {
      setError('Ingresa un correo de contacto válido.');
      return;
    }
    const soloDigitos = values.telefono_contacto.replace(/\D/g, '');
    if (soloDigitos.length < 10) {
      setError('Ingresa un número de contacto válido (mínimo 10 dígitos).');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSave(values);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{initialValue ? 'Editar reporte' : 'Reportar mascota perdida'}</h3>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="mascota">Nombre de la mascota</label>
            <input id="mascota" value={values.mascota} onChange={(e) => handleChange('mascota', e.target.value)} />
          </div>

          <div className="modal-field">
            <label htmlFor="especie">Especie</label>
            <select id="especie" value={values.especie} onChange={(e) => handleChange('especie', e.target.value)}>
              {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={values.estado} onChange={(e) => handleChange('estado', e.target.value)}>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="zona_id">Zona donde se perdió</label>
            <select id="zona_id" value={values.zona_id} onChange={(e) => handleChange('zona_id', e.target.value)}>
              {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="fecha_perdida">Fecha de pérdida</label>
            <input
              id="fecha_perdida"
              type="date"
              value={values.fecha_perdida}
              onChange={(e) => handleChange('fecha_perdida', e.target.value)}
            />
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border, #E4E1D8)', margin: '4px 0 10px' }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-500)', margin: '0 0 6px' }}>
            DATOS DEL DUEÑO DE LA MASCOTA (a donde llegan los avisos)
          </p>

          <div className="modal-field">
            <label htmlFor="nombre_dueno">Nombre del dueño</label>
            <input
              id="nombre_dueno"
              placeholder="Ej. Ana Martínez López"
              value={values.nombre_dueno}
              onChange={(e) => handleChange('nombre_dueno', e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="email_contacto">Correo de contacto</label>
            <input
              id="email_contacto"
              type="email"
              placeholder="correo@ejemplo.com"
              value={values.email_contacto}
              onChange={(e) => handleChange('email_contacto', e.target.value)}
            />
          </div>

          <div className="modal-field">
            <label htmlFor="telefono_contacto">Teléfono de contacto</label>
            <input
              id="telefono_contacto"
              type="tel"
              placeholder="Ej. 9511234567"
              value={values.telefono_contacto}
              onChange={(e) => handleChange('telefono_contacto', e.target.value)}
            />
            <small style={{ color: 'var(--ink-500)', fontSize: 12 }}>
              El correo, SMS y WhatsApp de confirmación y avisos de avistamientos llegan a estos datos.
            </small>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-accent-sm" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}