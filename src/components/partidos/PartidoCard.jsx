import { useState, useEffect, useCallback } from 'react';
import { formatFecha } from '../../utils/formatFecha';

/**
 * Tarjeta visual de un partido con inputs de pronóstico.
 * @param {Object} props
 * @param {Object} props.partido - Datos del partido
 * @param {Object} props.pronostico - Pronóstico existente del usuario (puede ser null)
 * @param {boolean} props.faseCerrada - Si la fase está cerrada
 * @param {Function} props.onSavePronostico - Callback al guardar pronóstico
 */
export default function PartidoCard({ partido, pronostico, faseCerrada, onSavePronostico }) {
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar pronóstico existente
  useEffect(() => {
    if (pronostico) {
      setGolesLocal(pronostico.pronosticoLocal?.toString() ?? '');
      setGolesVisitante(pronostico.pronosticoVisitante?.toString() ?? '');
    }
  }, [pronostico]);

  const isLocked = faseCerrada || partido.estado === 'finalizado';
  const hasResult = partido.resultadoLocal !== null && partido.resultadoVisitante !== null;

  const handleSave = useCallback(async (local, visitante) => {
    if (isLocked) return;

    const pLocal = parseInt(local);
    const pVisitante = parseInt(visitante);

    if (isNaN(pLocal) || isNaN(pVisitante)) return;
    if (pLocal < 0 || pLocal > 20 || pVisitante < 0 || pVisitante > 20) return;

    setSaving(true);
    try {
      await onSavePronostico(partido.id, pLocal, pVisitante);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Error guardando pronóstico:', err);
    } finally {
      setSaving(false);
    }
  }, [isLocked, partido.id, onSavePronostico]);

  const handleLocalChange = (e) => {
    const val = e.target.value;
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 20)) {
      setGolesLocal(val);
      if (val !== '' && golesVisitante !== '') {
        handleSave(val, golesVisitante);
      }
    }
  };

  const handleVisitanteChange = (e) => {
    const val = e.target.value;
    if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 20)) {
      setGolesVisitante(val);
      if (golesLocal !== '' && val !== '') {
        handleSave(golesLocal, val);
      }
    }
  };

  // Badge de puntos
  const renderPuntsBadge = () => {
    if (!pronostico || pronostico.puntos === null || pronostico.puntos === undefined) return null;

    const config = {
      exacto: { className: 'badge-exacto', label: '5 pts ⭐', icon: 'Exacto' },
      resultado: { className: 'badge-resultado', label: '3 pts ✓', icon: 'Resultado' },
      ninguno: { className: 'badge-ninguno', label: '0 pts ✗', icon: 'Fallido' },
    };

    const badge = config[pronostico.tipoAcierto] || config.ninguno;

    return (
      <div className={`${badge.className} animate-bounce-in`}>
        {badge.label}
      </div>
    );
  };

  return (
    <div className={`${hasResult ? 'match-card-finalizado' : 'match-card'} animate-fade-in`}>
      {/* Header: grupo y fecha */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {partido.grupo && (
            <span className="text-[10px] font-bold text-dorado bg-dorado/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Grupo {partido.grupo}
            </span>
          )}
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">
            Ronda {partido.ronda}
          </span>
        </div>
        <span className="text-xs text-white/40">
          {formatFecha(partido.fechaHora, { short: true })}
        </span>
      </div>

      {/* Equipos y marcadores */}
      <div className="flex items-center justify-between gap-3">
        {/* Equipo Local */}
        <div className="flex-1 text-center min-w-0">
          <span className="text-2xl sm:text-3xl block mb-1">{partido.banderaLocal}</span>
          <p className="text-sm font-semibold text-white truncate">{partido.equipoLocal}</p>
        </div>

        {/* Marcadores */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Resultado real (si existe) */}
          {hasResult ? (
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl text-xl font-bold text-white border border-white/10">
                {partido.resultadoLocal}
              </div>
              <span className="text-white/30 font-bold">-</span>
              <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-xl text-xl font-bold text-white border border-white/10">
                {partido.resultadoVisitante}
              </div>
            </div>
          ) : (
            <>
              {/* Inputs de pronóstico */}
              <input
                type="number"
                min="0"
                max="20"
                value={golesLocal}
                onChange={handleLocalChange}
                disabled={isLocked}
                className={isLocked ? 'input-score-locked' : 'input-score'}
                placeholder="–"
                id={`score-local-${partido.id}`}
              />
              <span className="text-white/30 font-bold text-lg">-</span>
              <input
                type="number"
                min="0"
                max="20"
                value={golesVisitante}
                onChange={handleVisitanteChange}
                disabled={isLocked}
                className={isLocked ? 'input-score-locked' : 'input-score'}
                placeholder="–"
                id={`score-visitante-${partido.id}`}
              />
            </>
          )}
        </div>

        {/* Equipo Visitante */}
        <div className="flex-1 text-center min-w-0">
          <span className="text-2xl sm:text-3xl block mb-1">{partido.banderaVisitante}</span>
          <p className="text-sm font-semibold text-white truncate">{partido.equipoVisitante}</p>
        </div>
      </div>

      {/* Footer: pronóstico del usuario + puntos */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-[10px] text-dorado animate-pulse">Guardando...</span>
          )}
          {saved && (
            <span className="text-[10px] text-exito animate-fade-in">✓ Guardado</span>
          )}
          {isLocked && !hasResult && (
            <span className="text-[10px] text-white/30">🔒 Cerrado</span>
          )}
          {!isLocked && golesLocal === '' && golesVisitante === '' && (
            <span className="text-[10px] text-white/30">Sin pronóstico</span>
          )}
          {hasResult && pronostico && golesLocal !== '' && (
            <span className="text-[10px] text-white/30">
              Tu pronóstico: {pronostico.pronosticoLocal} - {pronostico.pronosticoVisitante}
            </span>
          )}
        </div>
        {renderPuntsBadge()}
      </div>
    </div>
  );
}
