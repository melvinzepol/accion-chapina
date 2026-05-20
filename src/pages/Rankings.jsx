import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import Podio from '../components/rankings/Podio';
import RankingTable from '../components/rankings/RankingTable';

import { FASES_CONFIG } from '../utils/fasesConfig';

const FASES_TABS = [
  ...FASES_CONFIG.map(f => ({ id: f.id, nombre: f.short, icon: f.icon })),
  { id: 'global', nombre: 'Global', icon: '🌍' },
];

export default function Rankings() {
  const [faseActiva, setFaseActiva] = useState('global');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalParticipantes, setTotalParticipantes] = useState(0);

  // Cargar total de participantes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'participantes'), where('activo', '==', true)),
      (snapshot) => {
        setTotalParticipantes(snapshot.size);
      }
    );
    return unsubscribe;
  }, []);

  // Cargar rankings de la fase activa
  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, 'rankings'),
      where('fase', '==', faseActiva)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const raw = [];
      snapshot.forEach((doc) => {
        raw.push({ ...doc.data(), id: doc.id });
      });

      // Sort client-side
      raw.sort((a, b) => {
        if (b.puntosEnFase !== a.puntosEnFase) return b.puntosEnFase - a.puntosEnFase;
        return (b.marcadoresExactos || 0) - (a.marcadoresExactos || 0);
      });

      // Compute positions with ties
      let currentPos = 1;
      const data = raw.map((d, i) => {
        if (i > 0) {
          const prev = raw[i - 1];
          if (d.puntosEnFase !== prev.puntosEnFase || d.marcadoresExactos !== prev.marcadoresExactos) {
            currentPos = i + 1;
          }
        }
        return { ...d, posicion: currentPos };
      });

      setRankings(data);
      setLoading(false);
    }, (error) => {
      console.error('Error cargando rankings:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [faseActiva]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Rankings</h1>
        <p className="section-subtitle">
          Clasificación de participantes
          {totalParticipantes > 0 && ` • ${totalParticipantes} participantes`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {FASES_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFaseActiva(tab.id)}
            className={`tab-item flex items-center gap-1.5 ${faseActiva === tab.id ? 'active' : ''}`}
            id={`ranking-tab-${tab.id}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.nombre}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-dorado/30 border-t-dorado rounded-full animate-spin" />
              <span className="text-white/40 text-sm">Cargando rankings...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Podio */}
            {rankings.length > 0 && (
              <div className="p-6 border-b border-white/5">
                <Podio rankings={rankings} />
              </div>
            )}

            {/* Tabla completa */}
            <div className="p-4 sm:p-6">
              <RankingTable
                rankings={rankings}
                totalParticipantes={totalParticipantes}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
