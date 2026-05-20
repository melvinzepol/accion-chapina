import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import FaseIndicator from '../../components/partidos/FaseIndicator';
import { formatFecha } from '../../utils/formatFecha';

import { FASES_CONFIG } from '../../utils/fasesConfig';

const FASES_INFO = Object.fromEntries(
  FASES_CONFIG.map(f => [f.id, { nombre: f.nombre, icon: f.icon }])
);

export default function AdminFases() {
  const [fases, setFases] = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [ganadores, setGanadores] = useState([]);
  const [editingFase, setEditingFase] = useState(null);
  const [premioDesc, setPremioDesc] = useState('');
  const [ganadorUid, setGanadorUid] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar fases
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fases'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setFases(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Cargar participantes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'participantes'), where('activo', '==', true)),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
        setParticipantes(data);
      }
    );
    return unsubscribe;
  }, []);

  // Cargar ganadores existentes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'ganadores'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setGanadores(data);
    });
    return unsubscribe;
  }, []);

  const handleToggleEstado = async (fase) => {
    const newEstado = fase.estado === 'abierta' ? 'cerrada' : fase.estado === 'cerrada' ? 'finalizada' : 'abierta';
    const confirmMsg = `¿Cambiar estado de "${FASES_INFO[fase.id]?.nombre}" a "${newEstado}"?`;
    if (!window.confirm(confirmMsg)) return;

    await updateDoc(doc(db, 'fases', fase.id), { estado: newEstado });
  };

  const handleStartEditWinner = (fase) => {
    setEditingFase(fase.id);
    setPremioDesc(fase.premioDescripcion || '');
    setGanadorUid(fase.ganadorUid || '');
  };

  const handleSaveWinner = async (faseId) => {
    // Verificar anti-acaparamiento
    if (ganadorUid) {
      const yaGano = ganadores.find(
        (g) => g.participanteUid === ganadorUid && g.fase !== faseId
      );

      if (yaGano && faseId !== 'final') {
        const participante = participantes.find((p) => p.id === ganadorUid);
        const faseAnterior = FASES_INFO[yaGano.fase]?.nombre || yaGano.fase;
        const confirmed = window.confirm(
          `⚠️ ${participante?.nombreCompleto} ya ganó la ${faseAnterior}.\n\n¿Confirmas que ganó también esta fase?`
        );
        if (!confirmed) return;
      }

      const participante = participantes.find((p) => p.id === ganadorUid);

      // Actualizar fase
      await updateDoc(doc(db, 'fases', faseId), {
        premioDescripcion: premioDesc,
        ganadorUid,
        ganadorNombre: participante?.nombreCompleto || '',
      });

      // Registrar en colección ganadores
      await setDoc(doc(db, 'ganadores', faseId), {
        fase: faseId,
        participanteUid: ganadorUid,
        nombreCompleto: participante?.nombreCompleto || '',
        numeroCliente: participante?.numeroCliente || '',
        premioDescripcion: premioDesc,
        fechaRegistro: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, 'fases', faseId), {
        premioDescripcion: premioDesc,
      });
    }

    setEditingFase(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="section-title mb-1">Gestión de Fases</h1>
        <p className="section-subtitle">Estado, premios y ganadores</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="loading-shimmer h-40" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(FASES_INFO).map(([faseId, info]) => {
            const fase = fases.find((f) => f.id === faseId) || {
              id: faseId,
              estado: 'abierta',
              premioDescripcion: '',
              ganadorUid: null,
              ganadorNombre: null,
            };
            const ganador = ganadores.find((g) => g.fase === faseId);
            const isEditing = editingFase === faseId;

            return (
              <div key={faseId} className="glass-card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{info.nombre}</h3>
                      {fase.cierrePronosticos && (
                        <p className="text-xs text-white/30">
                          Cierre: {formatFecha(fase.cierrePronosticos)}
                        </p>
                      )}
                    </div>
                  </div>
                  <FaseIndicator estado={fase.estado} />
                </div>

                {/* Estado toggle */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleToggleEstado(fase)}
                    className="btn-secondary btn-sm text-xs"
                  >
                    Cambiar estado → {
                      fase.estado === 'abierta' ? 'Cerrada' :
                      fase.estado === 'cerrada' ? 'Finalizada' : 'Abierta'
                    }
                  </button>
                </div>

                {/* Premio y ganador */}
                {isEditing ? (
                  <div className="space-y-3 mt-4 p-4 bg-white/5 rounded-xl">
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Descripción del premio</label>
                      <input
                        type="text"
                        value={premioDesc}
                        onChange={(e) => setPremioDesc(e.target.value)}
                        className="input-field"
                        placeholder="Ej: TV 55 pulgadas, Q5,000, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/60 mb-1">Ganador</label>
                      <select
                        value={ganadorUid}
                        onChange={(e) => setGanadorUid(e.target.value)}
                        className="input-field"
                      >
                        <option value="">— Sin ganador —</option>
                        {participantes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombreCompleto} (#{p.numeroCliente})
                          </option>
                        ))}
                      </select>

                      {/* Warning anti-acaparamiento */}
                      {ganadorUid && ganadores.find(g => g.participanteUid === ganadorUid && g.fase !== faseId) && (
                        <div className="mt-2 p-3 bg-dorado/10 border border-dorado/20 rounded-xl">
                          <p className="text-dorado text-sm">
                            ⚠️ Este participante ya ganó la fase "{
                              FASES_INFO[ganadores.find(g => g.participanteUid === ganadorUid && g.fase !== faseId)?.fase]?.nombre
                            }"
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveWinner(faseId)} className="btn-primary btn-sm">
                        Guardar
                      </button>
                      <button onClick={() => setEditingFase(null)} className="btn-secondary btn-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {fase.premioDescripcion && (
                      <span className="text-sm text-white/50">
                        🎁 {fase.premioDescripcion}
                      </span>
                    )}
                    {ganador && (
                      <span className="text-sm text-exito font-medium">
                        🏆 {ganador.nombreCompleto} (#{ganador.numeroCliente})
                      </span>
                    )}
                    <button
                      onClick={() => handleStartEditWinner(fase)}
                      className="btn-secondary btn-sm text-xs ml-auto"
                    >
                      ✏ Premio / Ganador
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
