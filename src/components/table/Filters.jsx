import { useEffect, useState } from 'react';
import { fetchZonas } from '../../api/reports';

const ESPECIES = ['Perro', 'Gato', 'Ave', 'Otro'];
const ESTADOS = ['Perdido', 'Encontrado'];

export default function Filters({
  search, especie, estado, zonaId,
  onSearchChange, onEspecieChange, onEstadoChange, onZonaChange,
  onAddClick,
}) {
  const [zonas, setZonas] = useState([]);

  useEffect(() => {
    fetchZonas().then(setZonas).catch(() => setZonas([]));
  }, []);

  return (
    <div className="filters">
      <input
        type="text"
        placeholder="Buscar mascota o dueño..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select value={especie} onChange={(e) => onEspecieChange(e.target.value)}>
        <option value="">Especie: todas</option>
        {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>

      <select value={estado} onChange={(e) => onEstadoChange(e.target.value)}>
        <option value="">Estado: todos</option>
        {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
      </select>

      <select value={zonaId} onChange={(e) => onZonaChange(e.target.value)}>
        <option value="">Zona: todas</option>
        {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
      </select>

      <div className="spacer" />

      {onAddClick && (
        <button type="button" className="btn-accent-sm" onClick={onAddClick}>
          + Reportar mascota
        </button>
      )}
    </div>
  );
}