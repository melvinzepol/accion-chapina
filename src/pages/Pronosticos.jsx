import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PartidoCard from '../components/partidos/PartidoCard';
import CountdownTimer from '../components/partidos/CountdownTimer';
import FaseIndicator from '../components/partidos/FaseIndicator';

import { FASES_CONFIG } from '../utils/fasesConfig';

export default function Pronosticos() {
  const { user } = useAuth();
  const [faseActiva, setFaseActiva] = useState('grupos');
  const [partidos, setPartidos] = useState([]);
  const [pronosticos, setPronosticos] = useState({});
  const [fases, setFases] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar fases
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'fases'), (snapshot) => {
      const fasesMap = {};
      snapshot.forEach((doc) => {
        fasesMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setFases(fasesMap);
    });
    return unsubscribe;
  }, []);

  // Cargar partidos de la fase activa
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'partidos'),
      where('fase', '==', faseActiva)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partidosData = [];
      snapshot.forEach((doc) => {
        partidosData.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side to avoid composite index requirement
      partidosData.sort((a, b) => {
        const rondaA = a.ronda || 0;
        const rondaB = b.ronda || 0;
        if (rondaA !== rondaB) return rondaA - rondaB;
        const fechaA = a.fechaHora?.toDate?.() || new Date(0);
        const fechaB = b.fechaHora?.toDate?.() || new Date(0);
        return fechaA - fechaB;
      });
      setPartidos(partidosData);
      setLoading(false);
    }, (error) => {
      console.error('Error cargando partidos:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [faseActiva]);

  // Cargar pronósticos del usuario para la fase activa
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pronosticos'),
      where('participanteUid', '==', user.uid),
      where('fase', '==', faseActiva)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pronosticosMap = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        pronosticosMap[data.partidoId] = { id: doc.id, ...data };
      });
      setPronosticos(pronosticosMap);
    });

    return unsubscribe;
  }, [user, faseActiva]);

  // Guardar pronóstico
  const handleSavePronostico = useCallback(async (partidoId, pronosticoLocal, pronosticoVisitante) => {
    if (!user) return;

    const docId = `${user.uid}_${partidoId}`;
    const pronosticoData = {
      participanteUid: user.uid,
      partidoId,
      fase: faseActiva,
      pronosticoLocal,
      pronosticoVisitante,
      fechaModificacion: serverTimestamp(),
      puntos: null,
      tipoAcierto: null,
    };

    // Upsert: si no existe, agregar fechaIngreso
    if (!pronosticos[partidoId]) {
      pronosticoData.fechaIngreso = serverTimestamp();
    }

    await setDoc(doc(db, 'pronosticos', docId), pronosticoData, { merge: true });
  }, [user, faseActiva, pronosticos]);

  const faseData = fases[faseActiva];
  const faseCerrada = faseData?.estado !== 'abierta';

  // Agrupar partidos por ronda o grupo
  const grupos = {};
  partidos.forEach((p) => {
    const key = p.grupo ? `Grupo ${p.grupo}` : `Ronda ${p.ronda}`;
    if (!grupos[key]) grupos[key] = [];
    grupos[key].push(p);
  });

  // Contar pronósticos faltantes
  const totalPartidos = partidos.length;
  const pronosticosHechos = Object.keys(pronosticos).length;
  const faltantes = totalPartidos - pronosticosHechos;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title mb-1">Pronósticos</h1>
        <p className="section-subtitle">Ingresa tu predicción para cada partido</p>
      </div>

      {/* Tabs de fases */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-6 -mx-4 px-4">
        {FASES_CONFIG.map((fase) => (
          <button
            key={fase.id}
            onClick={() => setFaseActiva(fase.id)}
            className={`tab-item flex items-center gap-1.5 ${faseActiva === fase.id ? 'active' : ''}`}
            id={`tab-fase-${fase.id}`}
          >
            <span>{fase.icon}</span>
            <span className="hidden sm:inline">{fase.nombre}</span>
            <span className="sm:hidden">{fase.nombre.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Info de la fase */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 bg-fifa px-4 sm:px-6 py-2 rounded-xl text-crema shadow-lg shadow-fifa/20">
            <img src="/logo-leon.png" alt="León" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
            <h2 className="text-lg font-display font-bold uppercase tracking-wider">
              {FASES_CONFIG.find(f => f.id === faseActiva)?.nombre}
            </h2>
            <img src="/logo-leon.png" alt="León" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {faseData && <FaseIndicator estado={faseData.estado} />}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-white/40">
              {totalPartidos} partidos
            </span>
            {faltantes > 0 && !faseCerrada && (
              <span className="text-dorado text-xs font-medium bg-dorado/10 px-2 py-1 rounded-lg">
                ⚠ Te faltan {faltantes} pronósticos
              </span>
            )}
            {faltantes === 0 && totalPartidos > 0 && (
              <span className="text-exito text-xs font-medium bg-exito/10 px-2 py-1 rounded-lg">
                ✓ Todos completados
              </span>
            )}
          </div>
        </div>

        {/* Countdown */}
        {faseData?.cierrePronosticos && !faseCerrada && (
          <div className="mt-4">
            <CountdownTimer targetDate={faseData.cierrePronosticos} />
          </div>
        )}

        {faseCerrada && faseData && (
          <div className="mt-4 p-3 bg-error-pts/10 border border-error-pts/20 rounded-xl">
            <p className="text-error-pts text-sm">
              🔒 Los pronósticos para esta fase están cerrados. Tus pronósticos registrados son definitivos.
            </p>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="loading-shimmer h-32" />
          ))}
        </div>
      )}

      {/* Partidos */}
      {!loading && partidos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚽</div>
          <p className="text-white/40 text-lg mb-2">No hay partidos para esta fase</p>
          <p className="text-white/25 text-sm">Los partidos se irán agregando conforme avance el torneo</p>
        </div>
      )}

      {!loading && Object.entries(grupos).map(([groupName, groupPartidos]) => (
        <div key={groupName} className="mb-8">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 px-1">
            {groupName}
          </h3>
          <div className="space-y-3">
            {groupPartidos.map((partido) => (
              <PartidoCard
                key={partido.id}
                partido={partido}
                pronostico={pronosticos[partido.id] || null}
                faseCerrada={faseCerrada}
                onSavePronostico={handleSavePronostico}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
