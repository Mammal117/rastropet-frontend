import client, { extractErrorMessage } from './client';

// Trae reportes con paginación y filtros REALES resueltos por el backend
// (Laravel Resource::collection(paginate())).
export async function fetchReports({ page = 1, limit = 10, search = '', especie = '', estado = '', zonaId = '' }) {
  try {
    const res = await client.get('/reportes', {
      params: {
        page,
        per_page: limit,
        search: search || undefined,
        especie: especie || undefined,
        estado: estado || undefined,
        zona_id: zonaId || undefined,
      },
    });
    return {
      data: res.data.data,
      total: res.data.meta?.total ?? 0,
      currentPage: res.data.meta?.current_page ?? page,
      lastPage: res.data.meta?.last_page ?? 1,
    };
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function fetchReport(id) {
  try {
    const res = await client.get(`/reportes/${id}`);
    return res.data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function addReport(payload) {
  try {
    const res = await client.post('/reportes', payload);
    return res.data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function updateReport(id, payload) {
  try {
    const res = await client.put(`/reportes/${id}`, payload);
    return res.data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function deleteReport(id) {
  try {
    await client.delete(`/reportes/${id}`);
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

// --- Zonas (para el selector de filtro y el formulario de alta) ---
export async function fetchZonas() {
  try {
    const res = await client.get('/zonas');
    return res.data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

// --- Avistamientos (rol voluntario con integración de WhatsApp) ---
export async function addAvistamiento(reporteId, payload, telefonoDueno, nombreMascota) {
  try {
    const res = await client.post(`/reportes/${reporteId}/avistamientos`, payload);
    
    // Si hay teléfono del dueño registrado, abre WhatsApp automáticamente
    if (telefonoDueno) {
      const texto = `¡Hola! Acabo de registrar un avistamiento de tu mascota *${nombreMascota}*. Mensaje: ${payload.mensaje || 'Sin comentarios adicionales'}`;
      const telefonoLimpio = telefonoDueno.replace(/\D/g, '');
      window.open(`https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(texto)}`, '_blank');
    }

    return res.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

export async function fetchAvistamientos(reporteId) {
  try {
    const res = await client.get(`/reportes/${reporteId}/avistamientos`);
    return res.data.data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}