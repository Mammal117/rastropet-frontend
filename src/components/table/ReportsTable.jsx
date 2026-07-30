function getIniciales(name) {
  return (name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function ReportsTable({ reports, loading, error, currentUser, onEdit, onDelete, onAvistar }) {
  if (loading) return <div className="state-message">Cargando reportes...</div>;
  if (error) return <div className="state-message error">{error}</div>;
  if (reports.length === 0) return <div className="state-message">No se encontraron reportes.</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Reportado por</th>
          <th>Dueño de la mascota</th>
          <th>Mascota</th>
          <th>Especie</th>
          <th>Zona</th>
          <th>Estado</th>
          <th>Fecha de pérdida</th>
          <th>Avistamientos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => {
          // Un dueño solo puede editar/eliminar SUS propios reportes (el backend también lo valida con la Policy)
          const esPropio = currentUser?.role?.name === 'admin' || currentUser?.id === r.dueno?.id;

          return (
            <tr key={r.id}>
              <td>
                <div className="member-cell">
                  <div className="avatar-fallback">{getIniciales(r.dueno?.name)}</div>
                  <div>
                    <div className="name">{r.dueno?.name}</div>
                    <div className="email">{r.dueno?.email}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="name">{r.nombre_dueno}</div>
                {r.email_contacto && <div className="email">{r.email_contacto}</div>}
                {r.telefono_contacto && <div className="email">{r.telefono_contacto}</div>}
              </td>
              <td>
                {r.mascota}
                <div style={{ fontSize: 11, color: '#78766F' }}>{r.numero_reporte}</div>
              </td>
              <td>{r.especie}</td>
              <td>{r.zona?.nombre}</td>
              <td>
                <span className={`badge badge-${r.estado === 'Perdido' ? 'Vencido' : 'Activo'}`}>
                  {r.estado}
                </span>
              </td>
              <td>{r.fecha_perdida}</td>
              <td>{r.total_avistamientos ?? 0}</td>
              <td>
                <div className="row-actions">
                  {onAvistar && (
                    <button type="button" className="icon-btn" onClick={() => onAvistar(r)}>Avistar</button>
                  )}
                  {esPropio && (
                    <>
                      <button type="button" className="icon-btn" onClick={() => onEdit(r)}>Editar</button>
                      <button type="button" className="icon-btn danger" onClick={() => onDelete(r)}>Eliminar</button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}