import { useState } from 'react';
import { addAvistamiento } from '../../api/reports';

export default function AvistamientoFormModal({ reporte, onDone, onCancel }) {
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comentario.trim()) {
      setError('Describe brevemente dónde viste a la mascota.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      // Solo manda la petición al backend de Laravel. 
      // El servidor se encarga de que el bot mande el mensaje solo.
      await addAvistamiento(reporte.id, {
        comentario,
        lat: reporte.lat ?? reporte.zona?.lat ?? 17.0732,
        lng: reporte.lng ?? reporte.zona?.lng ?? -96.7266,
      });

      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>Reportar avistamiento de {reporte.mascota}</h3>
        <p style={{ fontSize: 13, color: 'var(--ink-500)' }}>
          Se notificará al dueño automáticamente mediante el bot de WhatsApp.
        </p>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="comentario">¿Dónde la viste?</label>
            <input
              id="comentario"
              placeholder="Ej. Cerca del mercado, parecía asustada"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-accent-sm" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Reportar avistamiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}