/**
 * Calcula los puntos obtenidos comparando un pronóstico con el resultado real.
 *
 * @param {number} pronosticoLocal  - Goles pronosticados para equipo local
 * @param {number} pronosticoVisitante - Goles pronosticados para equipo visitante
 * @param {number} resultadoLocal - Goles reales del equipo local
 * @param {number} resultadoVisitante - Goles reales del equipo visitante
 * @returns {{ puntos: number, tipo: 'exacto' | 'resultado' | 'ninguno' }}
 */
export function calcularPuntos(pronosticoLocal, pronosticoVisitante, resultadoLocal, resultadoVisitante) {
  // Marcador exacto = 5 puntos
  if (pronosticoLocal === resultadoLocal && pronosticoVisitante === resultadoVisitante) {
    return { puntos: 5, tipo: 'exacto' };
  }

  // Determinar ganador según pronóstico
  const ganadorPronostico = pronosticoLocal > pronosticoVisitante
    ? 'local'
    : pronosticoLocal < pronosticoVisitante
      ? 'visitante'
      : 'empate';

  // Determinar ganador real
  const ganadorReal = resultadoLocal > resultadoVisitante
    ? 'local'
    : resultadoLocal < resultadoVisitante
      ? 'visitante'
      : 'empate';

  // Acierta ganador/empate = 3 puntos
  if (ganadorPronostico === ganadorReal) {
    return { puntos: 3, tipo: 'resultado' };
  }

  // Pronóstico incorrecto = 0 puntos
  return { puntos: 0, tipo: 'ninguno' };
}
