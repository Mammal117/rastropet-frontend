import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import DashboardHome from './DashboardHome';
import ReportsPage from './ReportsPage';
import MapPage from './MapPage';
import StatsPage from './StatsPage';

const TITLES = {
  dashboard: 'Dashboard',
  reportes: 'Reportes',
  mapa: 'Mapa',
  estadisticas: 'Estadísticas',
};

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="app-shell">
      <Sidebar active={activeSection} onSelect={setActiveSection} />

      <div className="main">
        <Navbar title={TITLES[activeSection]} />

        <div className="content">
          {activeSection === 'dashboard' ? (
            <DashboardHome />
          ) : activeSection === 'reportes' ? (
            <ReportsPage />
          ) : activeSection === 'mapa' ? (
            <MapPage />
          ) : activeSection === 'estadisticas' ? (
            <StatsPage />
          ) : null}
        </div>
      </div>
    </div>
  );
}