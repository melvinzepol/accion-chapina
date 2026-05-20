/**
 * Utilidades para formateo de fechas en zona horaria de Guatemala (GMT-6).
 */

/**
 * Formatea un Firestore Timestamp o Date a string legible en hora Guatemala.
 * @param {Object|Date} timestamp - Firestore Timestamp o Date
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.includeTime - Incluir hora (default: true)
 * @param {boolean} options.short - Formato corto (default: false)
 * @returns {string}
 */
export function formatFecha(timestamp, { includeTime = true, short = false } = {}) {
  if (!timestamp) return '';

  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return '';
  }

  const opciones = {
    timeZone: 'America/Guatemala',
    ...(short
      ? { day: 'numeric', month: 'short' }
      : { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }
    ),
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
  };

  return date.toLocaleString('es-GT', opciones);
}

/**
 * Formatea la diferencia entre ahora y una fecha futura como countdown.
 * @param {Object|Date} targetTimestamp - Fecha objetivo
 * @returns {{ days: number, hours: number, minutes: number, seconds: number, total: number, expired: boolean }}
 */
export function getCountdown(targetTimestamp) {
  let target;
  if (targetTimestamp?.toDate) {
    target = targetTimestamp.toDate();
  } else if (targetTimestamp instanceof Date) {
    target = targetTimestamp;
  } else if (typeof targetTimestamp === 'string') {
    target = new Date(targetTimestamp);
  } else {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
  }

  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, expired: true };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
    expired: false,
  };
}

/**
 * Verifica si una fecha ya pasó (en cualquier zona horaria).
 * @param {Object|Date} timestamp
 * @returns {boolean}
 */
export function hasPassed(timestamp) {
  const { expired } = getCountdown(timestamp);
  return expired;
}
