/**
 * Utilidades puras de validación y sanitización del backend.
 *
 * No dependen de Supabase/Express/dotenv, por lo que se pueden
 * testear de forma aislada con `node --test`.
 */

/**
 * Sanitiza un string: elimina etiquetas HTML/script y recorta longitud
 */
function sanitizar(valor, maxLen = 1000) {
  if (typeof valor !== 'string') return valor;
  return valor
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLen);
}

/**
 * Valida formato de hora HH:MM (acepta segundos opcionales HH:MM:SS)
 */
function esHoraValida(hora) {
  return /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(hora);
}

/**
 * Normaliza una hora a formato HH:MM (elimina segundos si los tiene)
 */
function aHoraMin(valor) {
  if (typeof valor !== 'string') return valor;
  const m = valor.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return valor;
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

/**
 * Valida formato de fecha YYYY-MM-DD (con rangos de día/mes y años bisiestos)
 */
function esFechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [y, m, d] = fecha.split('-').map(Number);
  if (m < 1 || m > 12) return false;
  const diasDelMes = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d >= 1 && d <= diasDelMes;
}

/**
 * Obtiene la fecha de hoy como string YYYY-MM-DD
 */
function hoy() {
  return new Date().toISOString().split('T')[0];
}

module.exports = {
  sanitizar,
  esHoraValida,
  aHoraMin,
  esFechaValida,
  hoy,
};
