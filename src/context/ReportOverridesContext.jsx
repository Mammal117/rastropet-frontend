import { createContext, useContext, useState, useCallback } from 'react';

const ReportOverridesContext = createContext(null);

export function ReportOverridesProvider({ children }) {
  const [overrides, setOverrides] = useState({});
  const [deletedIds, setDeletedIds] = useState(() => new Set());
  const [extras, setExtras] = useState([]);

  const setOverride = useCallback((id, fields) => {
    setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...fields } }));
  }, []);

  const markDeleted = useCallback((id) => {
    setDeletedIds((prev) => new Set(prev).add(id));
  }, []);

  const addExtra = useCallback((report) => {
    setExtras((prev) => [{ ...report, isExtra: true }, ...prev]);
  }, []);

  const updateExtra = useCallback((id, fields) => {
    setExtras((prev) => prev.map((r) => (r.id === id ? { ...r, ...fields } : r)));
  }, []);

  const removeExtra = useCallback((id) => {
    setExtras((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Aplica ediciones/eliminaciones a una lista traída de la API,
  // y le agrega los reportes creados localmente.
  function applyOverrides(baseList) {
    const merged = baseList
      .filter((r) => !deletedIds.has(r.id))
      .map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r));
    return [...extras, ...merged];
  }

  const value = { setOverride, markDeleted, addExtra, updateExtra, removeExtra, applyOverrides };
  return (
    <ReportOverridesContext.Provider value={value}>
      {children}
    </ReportOverridesContext.Provider>
  );
}

export function useReportOverrides() {
  const ctx = useContext(ReportOverridesContext);
  if (!ctx) throw new Error('useReportOverrides debe usarse dentro de ReportOverridesProvider');
  return ctx;
}