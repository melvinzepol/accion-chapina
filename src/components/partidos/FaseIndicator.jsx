/**
 * Indicador visual del estado de una fase.
 * @param {{ estado: 'abierta' | 'cerrada' | 'finalizada' }} props
 */
export default function FaseIndicator({ estado }) {
  const config = {
    abierta: {
      className: 'badge-fase-abierta',
      icon: '🟢',
      label: 'Abierta',
    },
    cerrada: {
      className: 'badge-fase-cerrada',
      icon: '🔴',
      label: 'Cerrada',
    },
    finalizada: {
      className: 'badge-fase-cerrada',
      icon: '🏁',
      label: 'Finalizada',
    },
  };

  const { className, icon, label } = config[estado] || config.cerrada;

  return (
    <span className={className}>
      <span className="text-xs">{icon}</span>
      {label}
    </span>
  );
}
