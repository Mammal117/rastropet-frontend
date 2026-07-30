import { usePetReports } from '../hooks/usePetReports';
import { ESPECIES, calcularDiasPerdida, ICONOS_ESPECIE } from '../utils/petData';

export default function StatsPage() {
  const { reports, loading, error } = usePetReports({ page: 1, limit: 100, search: '' });

  if (loading) return <div className="state-message">Cargando estadísticas...</div>;
  if (error) return <div className="state-message error">{error}</div>;

  const perdidos = reports.filter((r) => r.estado === 'Perdido');
  const encontrados = reports.filter((r) => r.estado === 'Encontrado');

  const promedioHorasResueltos = encontrados.length > 0
    ? encontrados.reduce((sum, r) => {
        const horas = (Date.now() - new Date(r.fecha_perdida).getTime()) / (1000 * 60 * 60);
        return sum + horas;
      }, 0) / encontrados.length
    : 0;

  const diasPromedio = (promedioHorasResueltos / 24).toFixed(1);

  const masUrgentes = [...perdidos]
    .sort((a, b) => new Date(a.fecha_perdida) - new Date(b.fecha_perdida))
    .slice(0, 5);

  const distribucionPorEspecie = ESPECIES.map((especie) => {
    const total = reports.filter((r) => r.especie === especie);
    return {
      especie,
      perdidos: total.filter((r) => r.estado === 'Perdido').length,
      encontrados: total.filter((r) => r.estado === 'Encontrado').length,
    };
  }).filter((e) => e.perdidos + e.encontrados > 0);

  const rangos = [
    { label: 'Menos de 1 día', min: 0, max: 24 },
    { label: '1 a 3 días', min: 24, max: 72 },
    { label: '3 a 7 días', min: 72, max: 168 },
    { label: 'Más de 7 días', min: 168, max: Infinity },
  ];
  const distribucionPorAntiguedad = rangos.map((rango) => {
    const cantidad = perdidos.filter((r) => {
      const horas = (Date.now() - new Date(r.fecha_perdida).getTime()) / (1000 * 60 * 60);
      return horas >= rango.min && horas < rango.max;
    }).length;
    return { ...rango, cantidad };
  });

  const maxAntiguedad = Math.max(...distribucionPorAntiguedad.map((r) => r.cantidad), 1);

  return (
    <div>
      <h1>Estadísticas</h1>
      <div className="subtitle">Análisis detallado de los reportes registrados en el sistema</div>

      <div className="metrics">
        <div className="metric-card">
          <div className="label">Casos activos</div>
          <div className="value" style={{ color: '#C23030' }}>{perdidos.length}</div>
        </div>
        <div className="metric-card">
          <div className="label">Casos resueltos</div>
          <div className="value" style={{ color: '#1F8A50' }}>{encontrados.length}</div>
        </div>
        <div className="metric-card">
          <div className="label">Tiempo promedio hasta encontrarla</div>
          <div className="value" style={{ fontSize: 20 }}>{diasPromedio} días</div>
        </div>
        <div className="metric-card">
          <div className="label">Especie más reportada</div>
          <div className="value" style={{ fontSize: 20 }}>
            {distribucionPorEspecie.length > 0
              ? [...distribucionPorEspecie].sort((a, b) => (b.perdidos + b.encontrados) - (a.perdidos + a.encontrados))[0].especie
              : '—'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Perdido vs. Encontrado por especie</h3>
          {distribucionPorEspecie.map(({ especie, perdidos: p, encontrados: e }) => {
            const total = p + e;
            return (
              <div key={especie} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span>{ICONOS_ESPECIE[especie]} {especie}</span>
                  <span style={{ color: '#78766F' }}>{p} perdidos · {e} encontrados</span>
                </div>
                <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: '#EDEBE5' }}>
                  <div style={{ width: `${total > 0 ? (p / total) * 100 : 0}%`, background: '#C23030' }} />
                  <div style={{ width: `${total > 0 ? (e / total) * 100 : 0}%`, background: '#1F8A50' }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Antigüedad de los casos activos</h3>
          {distribucionPorAntiguedad.map(({ label, cantidad }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{label}</span>
                <strong>{cantidad}</strong>
              </div>
              <div style={{ height: 8, background: '#EDEBE5', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(cantidad / maxAntiguedad) * 100}%`,
                    background: '#E8A33D',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ padding: 20, marginTop: 20 }}>
        <h3 style={{ marginBottom: 14 }}>Casos más urgentes (llevan más tiempo perdidos)</h3>
        {masUrgentes.length === 0 ? (
          <div style={{ fontSize: 13, color: '#78766F' }}>No hay casos activos en este momento.</div>
        ) : (
          masUrgentes.map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #E7E5DF', fontSize: 13,
              }}
            >
              <div className="member-cell">
                <div className="avatar-fallback">{ICONOS_ESPECIE[r.especie] ?? '🐾'}</div>
                <div>
                  <div className="name">{r.mascota} <span style={{ color: '#78766F' }}>({r.especie})</span></div>
                  <div className="email">Dueño: {r.dueno?.name} · Zona: {r.zona?.nombre}</div>
                </div>
              </div>
              <span className="badge badge-Vencido">{calcularDiasPerdida(r.fecha_perdida)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}