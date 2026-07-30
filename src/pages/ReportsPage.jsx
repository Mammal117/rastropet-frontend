import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePetReports } from '../hooks/usePetReports';
import { addReport, updateReport, deleteReport } from '../api/reports';
import { useAuth } from '../context/AuthContext';
import Filters from '../components/table/Filters';
import ReportsTable from '../components/table/ReportsTable';
import Pagination from '../components/table/Pagination';
import ConfirmModal from '../components/modal/ConfirmModal';
import ReportFormModal from '../components/modal/ReportFormModal';
import AvistamientoFormModal from '../components/modal/AvistamientoFormModal';

export default function ReportsPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

    const [search, setSearch] = useState('');
  const [especie, setEspecie] = useState('');
  const [estado, setEstado] = useState('');
  const [zonaId, setZonaId] = useState('');


  const { reports, total, loading, error, refetch } = usePetReports({
    page, limit, search, especie, estado, zonaId,
  });
  function goToPage(newPage) { setSearchParams({ page: newPage, limit }); }
  function changeLimit(newLimit) { setSearchParams({ page: 1, limit: newLimit }); }

  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmingEdit, setConfirmingEdit] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [deletingReport, setDeletingReport] = useState(null);
  const [avistandoReport, setAvistandoReport] = useState(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

const puedeReportar = user?.role?.name === 'dueño' || user?.role?.name === 'admin';
const puedeAvistar = user?.role?.name === 'voluntario' || user?.role?.name === 'admin';

  async function handleAdd(values) {
    setActionError('');
    try {
      await addReport(values);
      setShowAddForm(false);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleEditSave(values) {
    setActionError('');
    try {
      await updateReport(editingReport.id, values);
      setEditingReport(null);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleDeleteConfirmed() {
    setActionError('');
    try {
      await deleteReport(deletingReport.id);
      setDeletingReport(null);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  }

  function handleAvistamientoDone() {
    setAvistandoReport(null);
    setActionSuccess('Avistamiento registrado. Se notificó al dueño por correo, SMS y WhatsApp.');
    setTimeout(() => setActionSuccess(''), 5000);
  }

  return (
    <div>
      <h1>Reportes</h1>
      <div className="subtitle">Mascotas perdidas y encontradas reportadas</div>

      {actionError && <div className="form-error" style={{ marginBottom: 14 }}>{actionError}</div>}
      {actionSuccess && (
        <div className="form-error" style={{ marginBottom: 14, background: '#DCF2E3', color: '#1F8A50' }}>
          {actionSuccess}
        </div>
      )}

      <div className="panel">
        <Filters
          search={search}
          especie={especie}
          estado={estado}
          zonaId={zonaId}
          onSearchChange={(v) => { setSearch(v); goToPage(1); }}
          onEspecieChange={(v) => { setEspecie(v); goToPage(1); }}
          onEstadoChange={(v) => { setEstado(v); goToPage(1); }}
          onZonaChange={(v) => { setZonaId(v); goToPage(1); }}
          onAddClick={puedeReportar ? () => setShowAddForm(true) : null}
        />

        <ReportsTable
          reports={reports}
          loading={loading}
          error={error}
          currentUser={user}
          onEdit={(r) => setConfirmingEdit(r)}
          onDelete={(r) => setDeletingReport(r)}
          onAvistar={puedeAvistar ? (r) => setAvistandoReport(r) : null}
        />

        <Pagination page={page} limit={limit} total={total} onPageChange={goToPage} onLimitChange={changeLimit} />
      </div>

      {showAddForm && (
        <ReportFormModal onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {confirmingEdit && (
        <ConfirmModal
          title="Editar reporte"
          message={`¿Deseas editar el reporte de "${confirmingEdit.mascota}"${confirmingEdit.dueno?.name ? ` (dueño: ${confirmingEdit.dueno.name})` : ''}?`}
          confirmLabel="Sí, editar"
          onConfirm={() => { setEditingReport(confirmingEdit); setConfirmingEdit(null); }}
          onCancel={() => setConfirmingEdit(null)}
        />
      )}

      {editingReport && (
        <ReportFormModal
          initialValue={editingReport}
          onSave={handleEditSave}
          onCancel={() => setEditingReport(null)}
        />
      )}

      {deletingReport && (
        <ConfirmModal
          title="Eliminar reporte"
          message={`¿Seguro que quieres eliminar el reporte de "${deletingReport.mascota}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeletingReport(null)}
        />
      )}

      {avistandoReport && (
        <AvistamientoFormModal
          reporte={avistandoReport}
          onDone={handleAvistamientoDone}
          onCancel={() => setAvistandoReport(null)}
        />
      )}
    </div>
  );
}