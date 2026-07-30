import { usePetReports } from '../hooks/usePetReports';
import { ESPECIES, ICONOS_ESPECIE } from '../utils/petData';

export default function DashboardHome() {
  const { reports, loading, error } = usePetReports({ page: 1, limit: 100, search: '' });

  if (loading) return <div className="state-message">Cargando resumen...</div>;
  if (error) return <div className="state-message error">{error}</div>;

  const totalPerdidos = reports.filter((r) => r.estado === 'Perdido').length;
  const totalEncontrados = reports.filter((r) => r.estado === 'Encontrado').length;

  const porEspecie = ESPECIES.map((especie) => ({
    especie,
    cantidad: reports.filter((r) => r.especie === especie).length,
  }));

  const reportesRecientes = [...reports]
    .sort((a, b) => new Date(b.fecha_perdida) - new Date(a.fecha_perdida))
    .slice(0, 5);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="subtitle">Resumen general de mascotas perdidas y encontradas</div>

      <div className="metrics">
        <div className="metric-card">
          <div className="label">Total de reportes</div>
          <div className="value">{reports.length}</div>
        </div>
        <div className="metric-card">
          <div className="label">Perdidos actualmente</div>
          <div className="value" style={{ color: '#C23030' }}>{totalPerdidos}</div>
        </div>
        <div className="metric-card">
          <div className="label">Encontrados</div>
          <div className="value" style={{ color: '#1F8A50' }}>{totalEncontrados}</div>
        </div>
        <div className="metric-card">
          <div className="label">Tasa de recuperación</div>
          <div className="value">
            {reports.length > 0 ? Math.round((totalEncontrados / reports.length) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Reportes por especie</h3>
          {porEspecie.map(({ especie, cantidad }) => (
            <div key={especie} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{ICONOS_ESPECIE[especie]} {especie}</span>
                <strong>{cantidad}</strong>
              </div>
              <div style={{ height: 6, background: '#EDEBE5', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${reports.length > 0 ? (cantidad / reports.length) * 100 : 0}%`,
                    background: '#E8A33D',
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <h3 style={{ marginBottom: 14 }}>Reportes recientes</h3>
          {reportesRecientes.length === 0 ? (
            <div style={{ fontSize: 13, color: '#78766F' }}>Aún no hay reportes registrados.</div>
          ) : (
            reportesRecientes.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid #E7E5DF', fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{ICONOS_ESPECIE[r.especie] ?? '🐾'}</span>
                  <strong>{r.mascota}</strong> ({r.especie})
                </div>
                <span className={`badge badge-${r.estado === 'Perdido' ? 'Vencido' : 'Activo'}`}>
                  {r.estado}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}