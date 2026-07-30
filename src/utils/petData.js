export const ESPECIES = ['Perro', 'Gato', 'Ave', 'Otro'];
export const ESTADOS = ['Perdido', 'Encontrado'];

export const ICONOS_ESPECIE = {
  Perro: '🐶',
  Gato: '🐱',
  Ave: '🐦',
  Otro: '🐾',
};

export function calcularDiasPerdida(fechaPerdida) {
  const msTranscurridos = Date.now() - new Date(fechaPerdida).getTime();
  const horas = msTranscurridos / (1000 * 60 * 60);
  if (horas < 24) {
    const h = Math.max(1, Math.round(horas));
    return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  }
  const dias = Math.round(horas / 24);
  return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
}

// Heurística propia para el radio de búsqueda en el mapa:
// ~0.5 km por cada hora transcurrida desde la pérdida, con un tope de 15 km.
export function calcularRadioBusqueda(fechaPerdida) {
  const msTranscurridos = Date.now() - new Date(fechaPerdida).getTime();
  const horas = Math.max(0, msTranscurridos / (1000 * 60 * 60));
  const km = Math.min(horas * 0.5, 15);
  return Math.max(km, 0.3);
}