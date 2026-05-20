import { useAuth } from '../../contexts/AuthContext';

/**
 * Tabla de ranking completa con highlight del usuario actual.
 * @param {{ rankings: Array, totalParticipantes?: number }} props
 */
export default function RankingTable({ rankings, totalParticipantes }) {
  const { user } = useAuth();

  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-white/40 text-sm">No hay datos de ranking para esta fase</p>
      </div>
    );
  }

  // Detectar empates técnicos
  const rankingsWithTie = rankings.map((r, i) => {
    const prev = rankings[i - 1];
    const isTie = prev &&
      prev.puntosEnFase === r.puntosEnFase &&
      prev.marcadoresExactos === r.marcadoresExactos;
    return { ...r, isTie };
  });

  return (
    <div>
      {totalParticipantes && (
        <p className="text-xs text-white/30 mb-3">
          {rankings.length} de {totalParticipantes} participantes
        </p>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="py-3 px-3 w-12">#</th>
              <th className="py-3 px-3">Participante</th>
              <th className="py-3 px-3 text-center w-20">Puntos</th>
              <th className="py-3 px-3 text-center w-16 hidden sm:table-cell">⭐</th>
              <th className="py-3 px-3 text-center w-16 hidden sm:table-cell">✓</th>
            </tr>
          </thead>
          <tbody>
            {rankingsWithTie.map((r, index) => {
              const isCurrentUser = user && r.participanteUid === user.uid;
              const isTop3 = r.posicion <= 3;

              return (
                <tr
                  key={r.participanteUid || index}
                  className={`
                    border-b border-white/5 transition-colors
                    ${isCurrentUser
                      ? 'bg-fifa/10 border-l-2 border-l-fifa'
                      : 'hover:bg-white/5'
                    }
                  `}
                >
                  {/* Posición */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      {r.isTie ? (
                        <span className="text-dorado font-bold text-xs">={r.posicion}</span>
                      ) : isTop3 ? (
                        <span className="text-lg">
                          {r.posicion === 1 ? '🥇' : r.posicion === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        <span className="text-white/60 font-medium">{r.posicion}</span>
                      )}
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className={`font-medium truncate max-w-[200px] ${isCurrentUser ? 'text-white' : 'text-white/80'}`}>
                        {r.nombreCompleto}
                        {isCurrentUser && (
                          <span className="ml-2 text-[10px] text-fifa font-bold">(TÚ)</span>
                        )}
                      </span>
                      {r.isTie && (
                        <span className="text-[10px] text-dorado mt-0.5">⚡ Empate técnico</span>
                      )}
                    </div>
                  </td>

                  {/* Puntos */}
                  <td className="py-3 px-3 text-center">
                    <span className={`font-display font-bold text-lg ${
                      isTop3 ? 'text-dorado' : 'text-white'
                    }`}>
                      {r.puntosEnFase}
                    </span>
                  </td>

                  {/* Marcadores exactos */}
                  <td className="py-3 px-3 text-center hidden sm:table-cell">
                    <span className="text-exito font-semibold">{r.marcadoresExactos}</span>
                  </td>

                  {/* Aciertos de resultado */}
                  <td className="py-3 px-3 text-center hidden sm:table-cell">
                    <span className="text-parcial font-semibold">{r.aciertosResultado || 0}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
