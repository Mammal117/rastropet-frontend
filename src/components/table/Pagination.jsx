export default function Pagination({ page, limit, total, onPageChange, onLimitChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pageNumbers = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let p = start; p <= end; p++) pageNumbers.push(p);

  return (
    <div className="pagination">
      <div className="info">Mostrando {from}–{to} de {total}</div>

      <div className="pages">
        <button type="button" className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button type="button" className="page-btn" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>›</button>
      </div>

      <div className="per-page">
        Filas por página
        <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={40}>40</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}