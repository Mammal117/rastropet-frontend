import { useEffect, useState, useCallback } from 'react';
import { fetchReports } from '../api/reports';

export function usePetReports({ page, limit, search, especie = '', estado = '', zonaId = '' }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const result = await fetchReports({ page, limit, search, especie, estado, zonaId });
        if (!cancelled) {
          setReports(result.data);
          setTotal(result.total);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [page, limit, search, especie, estado, zonaId, reloadFlag]);

  const refetch = useCallback(() => setReloadFlag((f) => f + 1), []);

  return { reports, total, loading, error, refetch };
}