import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatFecha } from '../utils/formatFecha';
import { FASE_NAMES } from '../utils/fasesConfig';

export default function Perfil() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    puntosTotales: 0,
    marcadoresExactos: 0,
    aciertosResultado: 0,
    pronosticosTotal: 0,
    fases: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Cargar todos los pronósticos del usuario
    const q = query(
      collection(db, 'pronosticos'),
      where('participanteUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let puntosTotales = 0;
      let marcadoresExactos = 0;
      let aciertosResultado = 0;
      let pronosticosTotal = 0;
      const fases = {};

      snapshot.forEach((doc) => {
        const data = doc.data();
        pronosticosTotal++;

        if (data.puntos !== null && data.puntos !== undefined) {
          puntosTotales += data.puntos;

          if (!fases[data.fase]) {
            fases[data.fase] = { puntos: 0, exactos: 0, resultados: 0, total: 0 };
          }
          fases[data.fase].puntos += data.puntos;
          fases[data.fase].total++;

          if (data.tipoAcierto === 'exacto') {
            marcadoresExactos++;
            fases[data.fase].exactos++;
          } else if (data.tipoAcierto === 'resultado') {
            aciertosResultado++;
            fases[data.fase].resultados++;
          }
        }
      });

      setStats({
        puntosTotales,
        marcadoresExactos,
        aciertosResultado,
        pronosticosTotal,
        fases,
      });
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (!profile) return null;



  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Profile card */}
      <div className="glass-card p-6 sm:p-8 mb-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-fifa to-dorado flex items-center justify-center shrink-0">
            <span className="text-3xl font-display font-black text-white">
              {profile.nombreCompleto?.charAt(0)?.toUpperCase()}
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-display font-bold text-white mb-1">
              {profile.nombreCompleto}
            </h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-white/40">
              <span className="flex items-center gap-1">
                <span className="text-dorado">#</span>{profile.numeroCliente}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{profile.email}</span>
            </div>
            {profile.fechaRegistro && (
              <p className="text-xs text-white/25 mt-2">
                Miembro desde {formatFecha(profile.fechaRegistro, { includeTime: false })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="loading-shimmer h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up">
          <StatCard
            value={stats.puntosTotales}
            label="Puntos totales"
            icon="🏆"
            color="text-dorado"
          />
          <StatCard
            value={stats.marcadoresExactos}
            label="Exactos (5pts)"
            icon="⭐"
            color="text-exito"
          />
          <StatCard
            value={stats.aciertosResultado}
            label="Resultados (3pts)"
            icon="✓"
            color="text-parcial"
          />
          <StatCard
            value={stats.pronosticosTotal}
            label="Pronósticos"
            icon="📝"
            color="text-white"
          />
        </div>
      )}

      {/* Desglose por fase */}
      <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="p-4 sm:p-6 border-b border-white/5">
          <h2 className="text-lg font-display font-bold text-white">Historial por Fase</h2>
        </div>

        {Object.keys(stats.fases).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/30 text-sm">Aún no tienes puntos registrados en ninguna fase</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {Object.entries(FASE_NAMES).map(([faseId, faseName]) => {
              const faseStats = stats.fases[faseId];
              if (!faseStats) return null;

              return (
                <div key={faseId} className="p-4 sm:p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{faseName}</h3>
                    <span className="text-xl font-display font-bold text-dorado">
                      {faseStats.puntos} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-exito">⭐ {faseStats.exactos} exactos</span>
                    <span className="text-parcial">✓ {faseStats.resultados} resultados</span>
                    <span className="text-white/30">{faseStats.total} partidos</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, icon, color }) {
  return (
    <div className="glass-card p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-display font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}
