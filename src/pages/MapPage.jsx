import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import { usePetReports } from '../hooks/usePetReports';
import { calcularRadioBusqueda, calcularDiasPerdida, ICONOS_ESPECIE } from '../utils/petData';
import '../components/map/leafletIconFix';

function colorPorUrgencia(km) {
  if (km >= 10) return '#C23030';
  if (km >= 4) return '#B4720A';
  return '#1F8A50';
}

export default function MapPage() {
  const { reports, loading, error } = usePetReports({ page: 1, limit: 100, search: '' });
  const [now, setNow] = useState(Date.now());
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="state-message">Cargando mapa...</div>;
  if (error) return <div className="state-message error">{error}</div>;

  const perdidos = reports.filter((r) => r.estado === 'Perdido' && r.lat && r.lng);
  const hayFiltroActivo = selectedId !== null;

  return (
    <div>
      <h1>Mapa de búsqueda</h1>
      <div className="subtitle">
        El radio crece según las horas transcurridas desde la pérdida. Haz clic en un marcador para resaltar solo esa zona.
      </div>

      {hayFiltroActivo && (
        <button
          type="button"
          className="btn-accent-sm"
          style={{ marginBottom: 12 }}
          onClick={() => setSelectedId(null)}
        >
          ← Ver todas las zonas
        </button>
      )}

      {perdidos.length === 0 ? (
        <div className="panel">
          <div className="state-message">No hay mascotas reportadas como perdidas en este momento.</div>
        </div>
      ) : (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <MapContainer
            center={[17.02, -96.68]}
            zoom={11}
            style={{ height: '520px', width: '100%' }}
            key={now}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {perdidos.map((r) => {
              const radioKm = calcularRadioBusqueda(r.fecha_perdida);
              const isSelected = r.id === selectedId;
              const isDimmed = hayFiltroActivo && !isSelected;
              const color = colorPorUrgencia(radioKm);

              return (
                <div key={r.id}>
                  <Circle
                    center={[r.lat, r.lng]}
                    radius={radioKm * 1000}
                    pathOptions={{
                      color: isDimmed ? '#B5B3AC' : color,
                      fillColor: isDimmed ? '#B5B3AC' : color,
                      fillOpacity: isDimmed ? 0.05 : (isSelected ? 0.28 : 0.15),
                      weight: isSelected ? 3 : 1.5,
                      opacity: isDimmed ? 0.3 : 1,
                    }}
                    eventHandlers={{ click: () => setSelectedId(r.id) }}
                  />
                  <Marker
                    position={[r.lat, r.lng]}
                    eventHandlers={{ click: () => setSelectedId(r.id) }}
                    opacity={isDimmed ? 0.35 : 1}
                  >
                    <Popup>
                      <strong>{ICONOS_ESPECIE[r.especie] ?? '🐾'} {r.mascota}</strong> ({r.especie})<br />
                      Folio: {r.numero_reporte}<br />
                      Zona: {r.zona?.nombre}<br />
                      Dueño: {r.dueno?.name}<br />
                      {calcularDiasPerdida(r.fecha_perdida)}<br />
                      Radio estimado: {radioKm.toFixed(1)} km
                    </Popup>
                  </Marker>
                </div>
              );
            })}
          </MapContainer>
        </div>
      )}

      <div className="panel" style={{ padding: 16, marginTop: 16, display: 'flex', gap: 20, fontSize: 13 }}>
        <div><span style={{ display: 'inline-block', width: 10, height: 10, background: '#1F8A50', borderRadius: '50%', marginRight: 6 }} />Recién perdido</div>
        <div><span style={{ display: 'inline-block', width: 10, height: 10, background: '#B4720A', borderRadius: '50%', marginRight: 6 }} />Tiempo intermedio</div>
        <div><span style={{ display: 'inline-block', width: 10, height: 10, background: '#C23030', borderRadius: '50%', marginRight: 6 }} />Mucho tiempo perdido</div>
      </div>
    </div>
  );
}