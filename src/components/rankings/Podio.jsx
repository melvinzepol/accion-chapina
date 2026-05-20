/**
 * Podio visual para los top 3 participantes.
 * @param {{ rankings: Array<{ nombreCompleto: string, puntosEnFase: number, marcadoresExactos: number, posicion: number }> }} props
 */
export default function Podio({ rankings }) {
  if (!rankings || rankings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/30 text-sm">Aún no hay rankings disponibles</p>
      </div>
    );
  }

  const top3 = rankings.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 py-6 px-4">
      {/* Segundo lugar */}
      {second && (
        <PodiumCard
          rank={2}
          data={second}
          height="h-28"
          medalEmoji="🥈"
          bgClass="podium-silver"
          delay="animation-delay-100"
        />
      )}

      {/* Primer lugar */}
      {first && (
        <PodiumCard
          rank={1}
          data={first}
          height="h-36"
          medalEmoji="🥇"
          bgClass="podium-gold"
          delay=""
        />
      )}

      {/* Tercer lugar */}
      {third && (
        <PodiumCard
          rank={3}
          data={third}
          height="h-20"
          medalEmoji="🥉"
          bgClass="podium-bronze"
          delay="animation-delay-200"
        />
      )}
    </div>
  );
}

function PodiumCard({ rank, data, height, medalEmoji, bgClass, delay }) {
  return (
    <div className={`flex flex-col items-center animate-slide-up ${delay}`} style={{ animationDelay: delay === 'animation-delay-100' ? '100ms' : delay === 'animation-delay-200' ? '200ms' : '0ms' }}>
      {/* Medal */}
      <div className="text-3xl sm:text-4xl mb-2 animate-bounce-in">{medalEmoji}</div>

      {/* Name */}
      <p className="text-sm font-bold text-white text-center mb-1 max-w-[100px] sm:max-w-[130px] truncate">
        {data.nombreCompleto}
      </p>

      {/* Points */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-lg sm:text-xl font-display font-black text-white">
          {data.puntosEnFase}
        </span>
        <span className="text-[10px] text-white/50 font-medium">pts</span>
      </div>

      {/* Pedestal */}
      <div className={`w-24 sm:w-28 ${height} ${bgClass} rounded-t-xl flex items-start justify-center pt-3`}>
        <span className="text-3xl sm:text-4xl font-display font-black text-white/90">
          {rank}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-white/40">
          ⭐ {data.marcadoresExactos} exactos
        </span>
      </div>
    </div>
  );
}
