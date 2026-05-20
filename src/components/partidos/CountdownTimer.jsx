import { useState, useEffect } from 'react';
import { getCountdown } from '../../utils/formatFecha';

/**
 * Countdown timer que muestra tiempo restante hasta el cierre de pronósticos.
 * @param {{ targetDate: any, label?: string }} props
 */
export default function CountdownTimer({ targetDate, label = 'Cierre de pronósticos' }) {
  const [countdown, setCountdown] = useState(() => getCountdown(targetDate));

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (countdown.expired) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-error-pts/10 border border-error-pts/20 rounded-xl">
        <span className="text-error-pts text-sm font-semibold">🔒 Pronósticos cerrados</span>
      </div>
    );
  }

  const isUrgent = countdown.total < 24 * 60 * 60 * 1000; // menos de 24h

  return (
    <div className={`rounded-xl p-4 ${isUrgent ? 'bg-error-pts/10 border border-error-pts/20 animate-pulse-red' : 'bg-dorado/10 border border-dorado/20'}`}>
      <p className={`text-xs font-medium mb-2 ${isUrgent ? 'text-error-pts' : 'text-dorado'}`}>
        {isUrgent ? '⚠️' : '⏱'} {label}
      </p>
      <div className="flex items-center gap-2">
        {/* Días */}
        {countdown.days > 0 && (
          <TimeUnit value={countdown.days} unit="días" urgent={isUrgent} />
        )}
        <TimeUnit value={countdown.hours} unit="hrs" urgent={isUrgent} />
        <span className={`text-lg font-bold ${isUrgent ? 'text-error-pts animate-count' : 'text-dorado'}`}>:</span>
        <TimeUnit value={countdown.minutes} unit="min" urgent={isUrgent} />
        <span className={`text-lg font-bold ${isUrgent ? 'text-error-pts animate-count' : 'text-dorado'}`}>:</span>
        <TimeUnit value={countdown.seconds} unit="seg" urgent={isUrgent} />
      </div>
    </div>
  );
}

function TimeUnit({ value, unit, urgent }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-14 h-12 flex items-center justify-center rounded-lg font-display text-xl font-bold
        ${urgent
          ? 'bg-error-pts/20 text-error-pts border border-error-pts/30'
          : 'bg-dorado/15 text-dorado border border-dorado/20'
        }`}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className={`text-[9px] mt-1 font-medium uppercase tracking-wider ${urgent ? 'text-error-pts/60' : 'text-dorado/60'}`}>
        {unit}
      </span>
    </div>
  );
}
