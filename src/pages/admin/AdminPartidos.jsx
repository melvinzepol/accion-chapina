import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  writeBatch,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { calcularPuntos } from '../../utils/calcularPuntos';
import { formatFecha } from '../../utils/formatFecha';

import { FASES_FILTER_OPTIONS, FASES_CONFIG } from '../../utils/fasesConfig';

const FASES_OPTIONS = FASES_FILTER_OPTIONS;

const ESTADO_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'en_juego', label: 'En juego' },
  { value: 'finalizado', label: 'Finalizados' },
];

export default function AdminPartidos() {
  const [partidos, setPartidos] = useState([]);
  const [filterFase, setFilterFase] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [resultLocal, setResultLocal] = useState('');
  const [resultVisitante, setResultVisitante] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nuevo partido form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPartido, setNewPartido] = useState({
    fase: 'octavos_cuartos',
    ronda: 1,
    grupo: '',
    equipoLocal: '',
    banderaLocal: '',
    equipoVisitante: '',
    banderaVisitante: '',
    fechaHora: '',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'partidos'),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        // Sort client-side to avoid composite index
        data.sort((a, b) => {
          if (a.fase !== b.fase) return (a.fase || '').localeCompare(b.fase || '');
          const rA = a.ronda || 0, rB = b.ronda || 0;
          if (rA !== rB) return rA - rB;
          const fA = a.fechaHora?.toDate?.() || new Date(0);
          const fB = b.fechaHora?.toDate?.() || new Date(0);
          return fA - fB;
        });
        setPartidos(data);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const filteredPartidos = partidos.filter((p) => {
    if (filterFase && p.fase !== filterFase) return false;
    if (filterEstado && p.estado !== filterEstado) return false;
    return true;
  });

  const handleStartEdit = (partido) => {
    setEditingId(partido.id);
    setResultLocal(partido.resultadoLocal?.toString() || '');
    setResultVisitante(partido.resultadoVisitante?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setResultLocal('');
    setResultVisitante('');
  };

  const handleSaveResult = async (partido) => {
    const rLocal = parseInt(resultLocal);
    const rVisitante = parseInt(resultVisitante);

    if (isNaN(rLocal) || isNaN(rVisitante) || rLocal < 0 || rVisitante < 0) {
      alert('Ingresa marcadores válidos (números >= 0)');
      return;
    }

    const confirmMsg = `¿Confirmas el resultado?\n\n${partido.equipoLocal} ${rLocal} - ${rVisitante} ${partido.equipoVisitante}\n\nEsto recalculará los puntos de todos los pronósticos.`;
    if (!window.confirm(confirmMsg)) return;

    setSaving(true);
    try {
      // 1. Actualizar resultado del partido
      await updateDoc(doc(db, 'partidos', partido.id), {
        resultadoLocal: rLocal,
        resultadoVisitante: rVisitante,
        estado: 'finalizado',
      });

      // 2. Recalcular puntos de todos los pronósticos de este partido
      const pronoQuery = query(
        collection(db, 'pronosticos'),
        where('partidoId', '==', partido.id)
      );
      const pronoSnap = await getDocs(pronoQuery);

      const batch = writeBatch(db);
      pronoSnap.forEach((pronoDoc) => {
        const prono = pronoDoc.data();
        const { puntos, tipo } = calcularPuntos(
          prono.pronosticoLocal,
          prono.pronosticoVisitante,
          rLocal,
          rVisitante
        );
        batch.update(pronoDoc.ref, { puntos, tipoAcierto: tipo });
      });
      await batch.commit();

      // 3. Recalcular rankings para la fase
      await recalcularRankings(partido.fase);

      setEditingId(null);
      setResultLocal('');
      setResultVisitante('');
    } catch (err) {
      console.error('Error guardando resultado:', err);
      alert('Error al guardar el resultado: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreatePartido = async () => {
    if (!newPartido.equipoLocal || !newPartido.equipoVisitante || !newPartido.fechaHora) {
      alert('Completa todos los campos requeridos');
      return;
    }

    try {
      const fechaHora = new Date(newPartido.fechaHora);

      await addDoc(collection(db, 'partidos'), {
        fase: newPartido.fase,
        ronda: parseInt(newPartido.ronda) || 1,
        grupo: newPartido.grupo || null,
        equipoLocal: newPartido.equipoLocal,
        banderaLocal: newPartido.banderaLocal || '🏳️',
        equipoVisitante: newPartido.equipoVisitante,
        banderaVisitante: newPartido.banderaVisitante || '🏳️',
        fechaHora,
        cierrePronosticos: null,
        resultadoLocal: null,
        resultadoVisitante: null,
        estado: 'pendiente',
      });

      setShowNewForm(false);
      setNewPartido({
        fase: 'octavos_cuartos', ronda: 1, grupo: '', equipoLocal: '',
        banderaLocal: '', equipoVisitante: '', banderaVisitante: '', fechaHora: '',
      });
    } catch (err) {
      console.error('Error creando partido:', err);
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">Gestión de Partidos</h1>
          <p className="section-subtitle">{filteredPartidos.length} partidos</p>
        </div>
        <button
          onClick={() => setShowNewForm(!showNewForm)}
          className="btn-primary btn-sm"
          id="btn-nuevo-partido"
        >
          + Nuevo Partido
        </button>
      </div>

      {/* New match form */}
      {showNewForm && (
        <div className="glass-card p-6 mb-6 animate-slide-down">
          <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Partido</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Fase</label>
              <select
                value={newPartido.fase}
                onChange={(e) => setNewPartido({ ...newPartido, fase: e.target.value })}
                className="input-field"
              >
                {FASES_CONFIG.map(f => (
                  <option key={f.id} value={f.id}>{f.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Ronda</label>
              <input type="number" min="1" value={newPartido.ronda}
                onChange={(e) => setNewPartido({ ...newPartido, ronda: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Equipo Local</label>
              <input type="text" value={newPartido.equipoLocal}
                onChange={(e) => setNewPartido({ ...newPartido, equipoLocal: e.target.value })}
                className="input-field" placeholder="Ej: México" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Bandera Local (emoji)</label>
              <input type="text" value={newPartido.banderaLocal}
                onChange={(e) => setNewPartido({ ...newPartido, banderaLocal: e.target.value })}
                className="input-field" placeholder="🇲🇽" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Equipo Visitante</label>
              <input type="text" value={newPartido.equipoVisitante}
                onChange={(e) => setNewPartido({ ...newPartido, equipoVisitante: e.target.value })}
                className="input-field" placeholder="Ej: Brasil" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Bandera Visitante (emoji)</label>
              <input type="text" value={newPartido.banderaVisitante}
                onChange={(e) => setNewPartido({ ...newPartido, banderaVisitante: e.target.value })}
                className="input-field" placeholder="🇧🇷" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Fecha y Hora</label>
              <input type="datetime-local" value={newPartido.fechaHora}
                onChange={(e) => setNewPartido({ ...newPartido, fechaHora: e.target.value })}
                className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleCreatePartido} className="btn-primary btn-sm">Crear Partido</button>
            <button onClick={() => setShowNewForm(false)} className="btn-secondary btn-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filterFase}
          onChange={(e) => setFilterFase(e.target.value)}
          className="input-field w-auto"
          id="filter-fase"
        >
          {FASES_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="input-field w-auto"
          id="filter-estado"
        >
          {ESTADO_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Matches table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="loading-shimmer h-20" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPartidos.map((partido) => (
            <div key={partido.id} className="glass-card p-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Match info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-center min-w-[100px]">
                    <span className="text-lg">{partido.banderaLocal}</span>
                    <p className="text-xs text-white truncate">{partido.equipoLocal}</p>
                  </div>

                  {editingId === partido.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" value={resultLocal}
                        onChange={(e) => setResultLocal(e.target.value)}
                        className="input-score w-14 h-10 text-lg"
                        placeholder="0"
                      />
                      <span className="text-white/30 font-bold">-</span>
                      <input
                        type="number" min="0" value={resultVisitante}
                        onChange={(e) => setResultVisitante(e.target.value)}
                        className="input-score w-14 h-10 text-lg"
                        placeholder="0"
                      />
                    </div>
                  ) : partido.resultadoLocal !== null ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                        {partido.resultadoLocal} - {partido.resultadoVisitante}
                      </span>
                    </div>
                  ) : (
                    <span className="text-white/30 text-sm">vs</span>
                  )}

                  <div className="text-center min-w-[100px]">
                    <span className="text-lg">{partido.banderaVisitante}</span>
                    <p className="text-xs text-white truncate">{partido.equipoVisitante}</p>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                    partido.estado === 'finalizado' ? 'bg-exito/15 text-exito' :
                    partido.estado === 'en_juego' ? 'bg-dorado/15 text-dorado' :
                    'bg-white/10 text-white/40'
                  }`}>
                    {partido.estado}
                  </span>

                  {editingId === partido.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSaveResult(partido)}
                        disabled={saving}
                        className="btn-primary btn-sm text-xs"
                      >
                        {saving ? '...' : '✓ Guardar'}
                      </button>
                      <button onClick={handleCancelEdit} className="btn-secondary btn-sm text-xs">
                        ✗
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(partido)}
                      className="btn-secondary btn-sm text-xs"
                      id={`edit-${partido.id}`}
                    >
                      {partido.resultadoLocal !== null ? '✏ Editar' : '+ Resultado'}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                <span>{partido.fase}</span>
                {partido.grupo && <span>Grupo {partido.grupo}</span>}
                <span>Ronda {partido.ronda}</span>
                {partido.fechaHora && (
                  <span>{formatFecha(partido.fechaHora, { short: true })}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Recalcula los rankings para una fase específica y el global.
 */
async function recalcularRankings(fase) {

  // Obtener todos los pronósticos de la fase con puntos
  const pronoSnap = await getDocs(
    query(collection(db, 'pronosticos'), where('fase', '==', fase))
  );

  // Agrupar por participante
  const participantesMap = {};
  pronoSnap.forEach((d) => {
    const data = d.data();
    if (data.puntos === null || data.puntos === undefined) return;

    if (!participantesMap[data.participanteUid]) {
      participantesMap[data.participanteUid] = {
        participanteUid: data.participanteUid,
        puntosEnFase: 0,
        marcadoresExactos: 0,
        aciertosResultado: 0,
      };
    }

    participantesMap[data.participanteUid].puntosEnFase += data.puntos;
    if (data.tipoAcierto === 'exacto') participantesMap[data.participanteUid].marcadoresExactos++;
    if (data.tipoAcierto === 'resultado') participantesMap[data.participanteUid].aciertosResultado++;
  });

  // Obtener nombres de participantes
  const partSnap = await getDocs(collection(db, 'participantes'));
  const nombres = {};
  partSnap.forEach((d) => {
    const data = d.data();
    nombres[d.id] = { nombreCompleto: data.nombreCompleto, numeroCliente: data.numeroCliente };
  });

  // Guardar rankings de fase
  const rankingsArray = Object.values(participantesMap)
    .map((p) => ({
      ...p,
      nombreCompleto: nombres[p.participanteUid]?.nombreCompleto || 'Desconocido',
      numeroCliente: nombres[p.participanteUid]?.numeroCliente || '',
      fase,
    }))
    .sort((a, b) => b.puntosEnFase - a.puntosEnFase || b.marcadoresExactos - a.marcadoresExactos);

  // Asignar posiciones
  let pos = 1;
  rankingsArray.forEach((r, i) => {
    if (i > 0) {
      const prev = rankingsArray[i - 1];
      if (r.puntosEnFase !== prev.puntosEnFase || r.marcadoresExactos !== prev.marcadoresExactos) {
        pos = i + 1;
      }
    }
    r.posicion = pos;
  });

  // Write rankings de fase
  const batch = writeBatch(db);
  rankingsArray.forEach((r) => {
    const rankDocId = `${r.participanteUid}_${fase}`;
    batch.set(doc(db, 'rankings', rankDocId), r);
  });
  await batch.commit();

  // Recalcular ranking global
  await recalcularRankingGlobal();
}

async function recalcularRankingGlobal() {

  // Obtener todos los pronósticos con puntos
  const allPronoSnap = await getDocs(collection(db, 'pronosticos'));

  const globalMap = {};
  allPronoSnap.forEach((d) => {
    const data = d.data();
    if (data.puntos === null || data.puntos === undefined) return;

    if (!globalMap[data.participanteUid]) {
      globalMap[data.participanteUid] = {
        participanteUid: data.participanteUid,
        puntosEnFase: 0,
        marcadoresExactos: 0,
        aciertosResultado: 0,
      };
    }

    globalMap[data.participanteUid].puntosEnFase += data.puntos;
    if (data.tipoAcierto === 'exacto') globalMap[data.participanteUid].marcadoresExactos++;
    if (data.tipoAcierto === 'resultado') globalMap[data.participanteUid].aciertosResultado++;
  });

  // Obtener nombres
  const partSnap = await getDocs(collection(db, 'participantes'));
  const nombres = {};
  partSnap.forEach((d) => {
    const data = d.data();
    nombres[d.id] = { nombreCompleto: data.nombreCompleto, numeroCliente: data.numeroCliente };
  });

  const globalRankings = Object.values(globalMap)
    .map((p) => ({
      ...p,
      nombreCompleto: nombres[p.participanteUid]?.nombreCompleto || 'Desconocido',
      numeroCliente: nombres[p.participanteUid]?.numeroCliente || '',
      fase: 'global',
    }))
    .sort((a, b) => b.puntosEnFase - a.puntosEnFase || b.marcadoresExactos - a.marcadoresExactos);

  let pos = 1;
  globalRankings.forEach((r, i) => {
    if (i > 0) {
      const prev = globalRankings[i - 1];
      if (r.puntosEnFase !== prev.puntosEnFase || r.marcadoresExactos !== prev.marcadoresExactos) {
        pos = i + 1;
      }
    }
    r.posicion = pos;
  });

  const batch = writeBatch(db);
  globalRankings.forEach((r) => {
    const rankDocId = `${r.participanteUid}_global`;
    batch.set(doc(db, 'rankings', rankDocId), r);
  });
  await batch.commit();
}
