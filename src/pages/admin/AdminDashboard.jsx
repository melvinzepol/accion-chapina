import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { clearAndSeed } from '../../utils/seedData';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    participantesActivos: 0,
    totalPronosticos: 0,
    totalPartidos: 0,
    partidosFinalizados: 0,
  });
  const [lider, setLider] = useState(null);
  const [ultimosResultados, setUltimosResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(null);
  const [seedDone, setSeedDone] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('⚠️ ADVERTENCIA: Esto borrará todos los partidos actuales y cargará los 104 partidos del Mundial y las 6 fases del torneo a Firestore.\n\n¿Estás seguro de continuar?')) return;
    setSeeding(true);
    setSeedProgress({ current: 0, total: 110, message: 'Iniciando carga...' });
    try {
      const result = await clearAndSeed((progress) => {
        setSeedProgress(progress);
      });
      setSeedDone(true);
      setSeedProgress({ current: result.partidos + result.fases, total: result.partidos + result.fases, message: `✅ ${result.partidos} partidos y ${result.fases} fases cargados exitosamente` });
      // Reload stats
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Error en seed:', err);
      setSeedProgress({ current: 0, total: 0, message: `❌ Error: ${err.message}` });
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        // Participantes activos
        const partSnap = await getDocs(
          query(collection(db, 'participantes'), where('activo', '==', true))
        );

        // Pronósticos
        const pronoSnap = await getDocs(collection(db, 'pronosticos'));

        // Partidos
        const matchSnap = await getDocs(collection(db, 'partidos'));
        let finalizados = 0;
        const resultados = [];
        matchSnap.forEach((doc) => {
          const d = doc.data();
          if (d.estado === 'finalizado') {
            finalizados++;
            resultados.push({ id: doc.id, ...d });
          }
        });

        // Líder global
        const rankSnap = await getDocs(
          query(
            collection(db, 'rankings'),
            where('fase', '==', 'global')
          )
        );
        let topRank = null;
        rankSnap.forEach((doc) => {
          const d = doc.data();
          if (!topRank || d.puntosEnFase > topRank.puntosEnFase) {
            topRank = d;
          }
        });

        if (isMounted) {
          setStats({
            participantesActivos: partSnap.size,
            totalPronosticos: pronoSnap.size,
            totalPartidos: matchSnap.size,
            partidosFinalizados: finalizados,
          });
          setLider(topRank);
          setUltimosResultados(
            resultados
              .sort((a, b) => {
                const ta = a.fechaHora?.toDate?.() || new Date(0);
                const tb = b.fechaHora?.toDate?.() || new Date(0);
                return tb - ta;
              })
              .slice(0, 5)
          );
          setLoading(false);
        }
      } catch (err) {
        console.error('Error cargando dashboard:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => { isMounted = false; };
  }, []);

  const posiblesPronosticos = stats.participantesActivos * stats.totalPartidos;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="mb-6">
        <h1 className="section-title mb-1">Panel de Administración</h1>
        <p className="section-subtitle">Dashboard general de la quiniela</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Link to="/admin/partidos" className="glass-card-hover p-4 text-center group">
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">⚽</span>
          <p className="text-sm font-medium text-white mt-2">Partidos</p>
          <p className="text-[10px] text-white/30">Resultados</p>
        </Link>
        <Link to="/admin/fases" className="glass-card-hover p-4 text-center group">
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📋</span>
          <p className="text-sm font-medium text-white mt-2">Fases</p>
          <p className="text-[10px] text-white/30">Gestión</p>
        </Link>
        <Link to="/admin/participantes" className="glass-card-hover p-4 text-center group">
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">👥</span>
          <p className="text-sm font-medium text-white mt-2">Participantes</p>
          <p className="text-[10px] text-white/30">Gestión</p>
        </Link>
        <Link to="/rankings" className="glass-card-hover p-4 text-center group">
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">📊</span>
          <p className="text-sm font-medium text-white mt-2">Rankings</p>
          <p className="text-[10px] text-white/30">Ver tabla</p>
        </Link>
      </div>

      {/* Seed data section — always available to admin for resetting */}
      {!loading && !seedDone && (
        <div className="glass-card p-6 mb-6 border-2 border-error-pts/30 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🏟️</div>
            <div className="flex-1">
              <h3 className="text-lg font-display font-bold text-white mb-1">Cargar/Reiniciar Partidos del Mundial</h3>
              <p className="text-sm text-white/50 mb-4">
                Usa esto para borrar todos los partidos actuales y cargar los 104 partidos reales del Mundial FIFA 2026
                y las 6 fases del torneo automáticamente.
              </p>

              {seedProgress && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">{seedProgress.message}</span>
                    <span className="text-xs text-dorado font-bold">
                      {seedProgress.total > 0 ? Math.round((seedProgress.current / seedProgress.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fifa to-dorado rounded-full transition-all duration-300"
                      style={{ width: `${seedProgress.total > 0 ? (seedProgress.current / seedProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleSeed}
                disabled={seeding}
                className="btn-dorado flex items-center gap-2"
                id="btn-seed-data"
              >
                {seeding ? (
                  <>
                    <div className="w-5 h-5 border-2 border-noche/30 border-t-noche rounded-full animate-spin" />
                    Cargando partidos...
                  </>
                ) : (
                  <>⚽ Cargar 104 partidos + 6 fases</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed done message */}
      {seedDone && (
        <div className="glass-card p-4 mb-6 border border-exito/30 animate-bounce-in">
          <p className="text-exito font-medium text-sm">
            ✅ ¡Datos cargados exitosamente! La página se recargará en un momento...
          </p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="loading-shimmer h-28" />)}
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-slide-up">
            <DashCard value={stats.participantesActivos} label="Participantes activos" icon="👥" color="text-dorado" />
            <DashCard
              value={`${stats.totalPronosticos} / ${posiblesPronosticos || '—'}`}
              label="Pronósticos (hecho/posible)"
              icon="📝"
              color="text-parcial"
            />
            <DashCard
              value={`${stats.partidosFinalizados} / ${stats.totalPartidos}`}
              label="Partidos finalizados"
              icon="⚽"
              color="text-exito"
            />
            <DashCard
              value={lider?.nombreCompleto || '—'}
              label={`Líder: ${lider?.puntosEnFase || 0} pts`}
              icon="🏆"
              color="text-dorado"
              small
            />
          </div>

          {/* Últimos resultados */}
          <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="p-4 border-b border-white/5">
              <h2 className="text-lg font-display font-bold text-white">Últimos Resultados</h2>
            </div>
            {ultimosResultados.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/30 text-sm">No hay resultados ingresados aún</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {ultimosResultados.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{p.banderaLocal}</span>
                      <span className="text-sm font-medium text-white">{p.equipoLocal}</span>
                      <span className="text-lg font-bold text-white bg-white/10 px-2 rounded">
                        {p.resultadoLocal} - {p.resultadoVisitante}
                      </span>
                      <span className="text-sm font-medium text-white">{p.equipoVisitante}</span>
                      <span>{p.banderaVisitante}</span>
                    </div>
                    <span className="text-xs text-white/30 uppercase">{p.fase}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function DashCard({ value, label, icon, color, small = false }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xl mb-2">{icon}</div>
      <div className={`${small ? 'text-sm truncate' : 'text-2xl'} font-display font-bold ${color}`}>
        {value}
      </div>
      <div className="text-[10px] text-white/40 font-medium mt-1">{label}</div>
    </div>
  );
}
