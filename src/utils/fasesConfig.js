/** Definición central de las fases del torneo FIFA 2026 */
export const FASES_CONFIG = [
  { id: 'grupos',        nombre: 'Fase de Grupos',       icon: '🏟️', short: 'Grupos' },
  { id: 'dieciseisavos', nombre: 'Dieciseisavos',        icon: '🎯', short: '16avos' },
  { id: 'octavos',       nombre: 'Octavos de Final',     icon: '⚔️', short: 'Octavos' },
  { id: 'cuartos',       nombre: 'Cuartos de Final',     icon: '🔥', short: 'Cuartos' },
  { id: 'semifinal',     nombre: 'Semifinales',          icon: '💥', short: 'Semis' },
  { id: 'final',         nombre: 'Gran Final',           icon: '🏆', short: 'Final' },
];

/** Map de fase id → nombre corto */
export const FASE_NAMES = Object.fromEntries(
  FASES_CONFIG.map(f => [f.id, f.short])
);

/** Opciones para filtros de select con opción "Todas" */
export const FASES_FILTER_OPTIONS = [
  { value: '', label: 'Todas las fases' },
  ...FASES_CONFIG.map(f => ({ value: f.id, label: f.nombre })),
];
