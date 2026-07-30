const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'estadisticas', label: 'Estadísticas' },
];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="sidebar">
      <div className="logo-wrap">
  <svg width="120" height="120" viewBox="0 0 24 24" fill="#E8A33D">
    <circle cx="12" cy="6" r="2.2"/>
    <circle cx="7" cy="9" r="1.8"/>
    <circle cx="17" cy="9" r="1.8"/>
    <path d="M12 10c-3 0-5.5 2.3-5.5 5.2 0 1.9 1.5 3.3 3.4 3.3.9 0 1.4-.4 2.1-.4s1.2.4 2.1.4c1.9 0 3.4-1.4 3.4-3.3C17.5 12.3 15 10 12 10z"/>
  </svg>
  <div className="logo">RASTROPET</div>
</div>

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}