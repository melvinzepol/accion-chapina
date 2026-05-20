import { useState, useEffect } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { exportToCSV } from '../../utils/exportCSV';
import { formatFecha } from '../../utils/formatFecha';
import { FASE_NAMES } from '../../utils/fasesConfig';

export default function AdminParticipantes() {
  const [participantes, setParticipantes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUid, setSelectedUid] = useState(null);
  const [selectedStats, setSelectedStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'participantes'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (a.nombreCompleto || '').localeCompare(b.nombreCompleto || ''));
      setParticipantes(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = participantes.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.nombreCompleto?.toLowerCase().includes(q) ||
      p.numeroCliente?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  const handleToggleActivo = async (participante) => {
    const newActivo = !participante.activo;
    const msg = newActivo
      ? `¿Reactivar a ${participante.nombreCompleto}?`
      : `¿Desactivar a ${participante.nombreCompleto}? No podrá acceder a la quiniela.`;
    if (!window.confirm(msg)) return;

    await updateDoc(doc(db, 'participantes', participante.id), { activo: newActivo });
  };

  const handleViewProfile = async (uid) => {
    if (selectedUid === uid) {
      setSelectedUid(null);
      setSelectedStats(null);
      return;
    }

    setSelectedUid(uid);
    setLoadingStats(true);

    try {
      const pronoSnap = await getDocs(
        query(collection(db, 'pronosticos'), where('participanteUid', '==', uid))
      );

      let puntosTotales = 0;
      let exactos = 0;
      let resultados = 0;
      let total = 0;
      const fases = {};

      pronoSnap.forEach((d) => {
        const data = d.data();
        total++;
        if (data.puntos !== null && data.puntos !== undefined) {
          puntosTotales += data.puntos;
          if (!fases[data.fase]) fases[data.fase] = { puntos: 0, exactos: 0, total: 0 };
          fases[data.fase].puntos += data.puntos;
          fases[data.fase].total++;
          if (data.tipoAcierto === 'exacto') { exactos++; fases[data.fase].exactos++; }
          if (data.tipoAcierto === 'resultado') resultados++;
        }
      });

      setSelectedStats({ puntosTotales, exactos, resultados, total, fases });
    } catch (err) {
      console.error('Error cargando stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportCSV = async () => {
    // Get global rankings for points
    const rankSnap = await getDocs(
      query(collection(db, 'rankings'), where('fase', '==', 'global'))
    );
    const rankMap = {};
    rankSnap.forEach((d) => {
      const data = d.data();
      rankMap[data.participanteUid] = data.puntosEnFase;
    });

    const exportData = participantes.map((p) => ({
      nombre: p.nombreCompleto,
      numeroCliente: p.numeroCliente,
      email: p.email,
      puntosGlobales: rankMap[p.id] || 0,
      activo: p.activo ? 'Sí' : 'No',
    }));

    exportToCSV(exportData, 'participantes_quiniela_2026', [
      { key: 'nombre', label: 'Nombre Completo' },
      { key: 'numeroCliente', label: 'Número de Cliente' },
      { key: 'email', label: 'Correo Electrónico' },
      { key: 'puntosGlobales', label: 'Puntos Globales' },
      { key: 'activo', label: 'Activo' },
    ]);
  };



  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title mb-1">Participantes</h1>
          <p className="section-subtitle">{participantes.length} registrados</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-dorado btn-sm text-xs"
          id="btn-export-csv"
        >
          📥 Exportar CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          placeholder="🔍 Buscar por nombre, # cliente o email..."
          id="search-participantes"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="loading-shimmer h-16" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p.id} className="glass-card overflow-hidden animate-fade-in">
              <div className="p-4 flex items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleViewProfile(p.id)}
                >
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white ${
                    p.activo ? 'bg-gradient-to-br from-fifa/80 to-dorado/80' : 'bg-white/10'
                  }`}>
                    {p.nombreCompleto?.charAt(0)?.toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${p.activo ? 'text-white' : 'text-white/40'}`}>
                      {p.nombreCompleto}
                      {p.rol === 'admin' && (
                        <span className="ml-2 text-[10px] text-dorado">👑 Admin</span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/30">
                      #{p.numeroCliente} • {p.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    p.activo ? 'bg-exito/15 text-exito' : 'bg-error-pts/15 text-error-pts'
                  }`}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => handleToggleActivo(p)}
                    className="btn-secondary btn-sm text-[10px]"
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>

              {/* Expanded stats */}
              {selectedUid === p.id && (
                <div className="px-4 pb-4 pt-0 border-t border-white/5 animate-slide-down">
                  {loadingStats ? (
                    <div className="py-4 text-center">
                      <div className="w-5 h-5 border-2 border-dorado/30 border-t-dorado rounded-full animate-spin mx-auto" />
                    </div>
                  ) : selectedStats ? (
                    <div className="pt-3">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <MiniStat value={selectedStats.puntosTotales} label="Puntos" />
                        <MiniStat value={selectedStats.exactos} label="Exactos" />
                        <MiniStat value={selectedStats.resultados} label="Resultados" />
                        <MiniStat value={selectedStats.total} label="Pronósticos" />
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-white/30">
                        {Object.entries(selectedStats.fases).map(([fase, stats]) => (
                          <span key={fase} className="bg-white/5 px-2 py-1 rounded">
                            {FASE_NAMES[fase]}: {stats.puntos}pts ({stats.exactos}⭐)
                          </span>
                        ))}
                      </div>
                      {p.fechaRegistro && (
                        <p className="text-[10px] text-white/20 mt-2">
                          Registrado: {formatFecha(p.fechaRegistro, { includeTime: false })}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">No se encontraron participantes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="text-center p-2 bg-white/5 rounded-lg">
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[9px] text-white/30 uppercase">{label}</div>
    </div>
  );
}
