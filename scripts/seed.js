/**
 * Seed script: Carga los 48 partidos de la Fase de Grupos del Mundial FIFA 2026.
 *
 * Uso:
 *   1. Configura las variables FIREBASE_* abajo o como variables de entorno
 *   2. Ejecuta: node scripts/seed.js
 *
 * Nota: Este script usa el Firebase Admin SDK para escrituras sin restricciones.
 *       Necesitas un archivo de credenciales de servicio.
 *
 * Alternativa simplificada: copia y pega los datos en la consola de Firebase.
 */

// ============================================================
// DATOS DE LOS 48 PARTIDOS DE FASE DE GRUPOS — FIFA 2026
// 12 grupos × 4 equipos × 3 partidos cada equipo = 48 partidos
// ============================================================

const GRUPOS = {
  A: [
    { nombre: 'Marruecos', bandera: '🇲🇦' },
    { nombre: 'Escocia', bandera: '🏴' },
    { nombre: 'Argentina', bandera: '🇦🇷' },
    { nombre: 'Por definir A4', bandera: '🏳️' },
  ],
  B: [
    { nombre: 'España', bandera: '🇪🇸' },
    { nombre: 'Países Bajos', bandera: '🇳🇱' },
    { nombre: 'Paraguay', bandera: '🇵🇾' },
    { nombre: 'Por definir B4', bandera: '🏳️' },
  ],
  C: [
    { nombre: 'México', bandera: '🇲🇽' },
    { nombre: 'Ecuador', bandera: '🇪🇨' },
    { nombre: 'Bolivia', bandera: '🇧🇴' },
    { nombre: 'Por definir C4', bandera: '🏳️' },
  ],
  D: [
    { nombre: 'Francia', bandera: '🇫🇷' },
    { nombre: 'Colombia', bandera: '🇨🇴' },
    { nombre: 'Arabia Saudita', bandera: '🇸🇦' },
    { nombre: 'Por definir D4', bandera: '🏳️' },
  ],
  E: [
    { nombre: 'Brasil', bandera: '🇧🇷' },
    { nombre: 'Italia', bandera: '🇮🇹' },
    { nombre: 'Australia', bandera: '🇦🇺' },
    { nombre: 'Por definir E4', bandera: '🏳️' },
  ],
  F: [
    { nombre: 'Estados Unidos', bandera: '🇺🇸' },
    { nombre: 'Uruguay', bandera: '🇺🇾' },
    { nombre: 'Panamá', bandera: '🇵🇦' },
    { nombre: 'Por definir F4', bandera: '🏳️' },
  ],
  G: [
    { nombre: 'Alemania', bandera: '🇩🇪' },
    { nombre: 'Serbia', bandera: '🇷🇸' },
    { nombre: 'Chile', bandera: '🇨🇱' },
    { nombre: 'Por definir G4', bandera: '🏳️' },
  ],
  H: [
    { nombre: 'Portugal', bandera: '🇵🇹' },
    { nombre: 'Japón', bandera: '🇯🇵' },
    { nombre: 'Canadá', bandera: '🇨🇦' },
    { nombre: 'Por definir H4', bandera: '🏳️' },
  ],
  I: [
    { nombre: 'Inglaterra', bandera: '🏴' },
    { nombre: 'Senegal', bandera: '🇸🇳' },
    { nombre: 'Costa Rica', bandera: '🇨🇷' },
    { nombre: 'Por definir I4', bandera: '🏳️' },
  ],
  J: [
    { nombre: 'Bélgica', bandera: '🇧🇪' },
    { nombre: 'Corea del Sur', bandera: '🇰🇷' },
    { nombre: 'Irán', bandera: '🇮🇷' },
    { nombre: 'Por definir J4', bandera: '🏳️' },
  ],
  K: [
    { nombre: 'Croacia', bandera: '🇭🇷' },
    { nombre: 'Ghana', bandera: '🇬🇭' },
    { nombre: 'Perú', bandera: '🇵🇪' },
    { nombre: 'Por definir K4', bandera: '🏳️' },
  ],
  L: [
    { nombre: 'Dinamarca', bandera: '🇩🇰' },
    { nombre: 'Nigeria', bandera: '🇳🇬' },
    { nombre: 'Suiza', bandera: '🇨🇭' },
    { nombre: 'Por definir L4', bandera: '🏳️' },
  ],
};

// Generar los 48 partidos (cada equipo juega contra los otros 3 de su grupo)
// Ronda 1: 1v2, 3v4 | Ronda 2: 1v3, 2v4 | Ronda 3: 1v4, 2v3
function generarPartidos() {
  const partidos = [];
  let contador = 1;

  // Fecha base: 11 de junio 2026, distribuidos en 3 rondas
  const fechasRonda = [
    new Date('2026-06-11T12:00:00-06:00'), // Ronda 1
    new Date('2026-06-15T12:00:00-06:00'), // Ronda 2
    new Date('2026-06-19T12:00:00-06:00'), // Ronda 3
  ];

  // Cierre de pronósticos: 9 de junio 2026 a las 23:59 hora Guatemala
  const cierrePronosticos = new Date('2026-06-09T23:59:00-06:00');

  for (const [grupo, equipos] of Object.entries(GRUPOS)) {
    // Ronda 1: equipo 0 vs 1, equipo 2 vs 3
    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 1,
      equipoLocal: equipos[0].nombre,
      banderaLocal: equipos[0].bandera,
      equipoVisitante: equipos[1].nombre,
      banderaVisitante: equipos[1].bandera,
      fechaHora: fechasRonda[0],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });

    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 1,
      equipoLocal: equipos[2].nombre,
      banderaLocal: equipos[2].bandera,
      equipoVisitante: equipos[3].nombre,
      banderaVisitante: equipos[3].bandera,
      fechaHora: fechasRonda[0],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });

    // Ronda 2: equipo 0 vs 2, equipo 1 vs 3
    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 2,
      equipoLocal: equipos[0].nombre,
      banderaLocal: equipos[0].bandera,
      equipoVisitante: equipos[2].nombre,
      banderaVisitante: equipos[2].bandera,
      fechaHora: fechasRonda[1],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });

    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 2,
      equipoLocal: equipos[1].nombre,
      banderaLocal: equipos[1].bandera,
      equipoVisitante: equipos[3].nombre,
      banderaVisitante: equipos[3].bandera,
      fechaHora: fechasRonda[1],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });

    // Ronda 3: equipo 0 vs 3, equipo 1 vs 2
    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 3,
      equipoLocal: equipos[0].nombre,
      banderaLocal: equipos[0].bandera,
      equipoVisitante: equipos[3].nombre,
      banderaVisitante: equipos[3].bandera,
      fechaHora: fechasRonda[2],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });

    partidos.push({
      id: `partido_${String(contador++).padStart(3, '0')}`,
      fase: 'grupos',
      grupo,
      ronda: 3,
      equipoLocal: equipos[1].nombre,
      banderaLocal: equipos[1].bandera,
      equipoVisitante: equipos[2].nombre,
      banderaVisitante: equipos[2].bandera,
      fechaHora: fechasRonda[2],
      cierrePronosticos,
      resultadoLocal: null,
      resultadoVisitante: null,
      estado: 'pendiente',
    });
  }

  return partidos;
}

// Fases del torneo
const FASES = [
  {
    id: 'grupos',
    nombre: 'Fase de Grupos',
    descripcion: '12 grupos de 4 equipos, 3 rondas de partidos',
    cierrePronosticos: new Date('2026-06-09T23:59:00-06:00'),
    estado: 'abierta',
    premioDescripcion: '',
    ganadorUid: null,
    ganadorNombre: null,
  },
  {
    id: 'octavos_cuartos',
    nombre: 'Octavos y Cuartos de Final',
    descripcion: '16 partidos de eliminación directa',
    cierrePronosticos: null, // Se define cuando se crean los partidos
    estado: 'abierta',
    premioDescripcion: '',
    ganadorUid: null,
    ganadorNombre: null,
  },
  {
    id: 'semifinales',
    nombre: 'Semifinales',
    descripcion: '2 semifinales + partido por 3er lugar',
    cierrePronosticos: null,
    estado: 'abierta',
    premioDescripcion: '',
    ganadorUid: null,
    ganadorNombre: null,
  },
  {
    id: 'final',
    nombre: 'Gran Final',
    descripcion: 'La final del Mundial FIFA 2026',
    cierrePronosticos: null,
    estado: 'abierta',
    premioDescripcion: '',
    ganadorUid: null,
    ganadorNombre: null,
  },
];

// ============================================================
// OUTPUT: Imprime los datos como JSON para importar en Firestore
// ============================================================

const partidos = generarPartidos();

console.log('=== DATOS DE SEED PARA QUINIELA MUNDIAL 2026 ===');
console.log(`\nTotal de partidos generados: ${partidos.length}`);
console.log(`Total de fases: ${FASES.length}\n`);

// Exportar como JSON para uso con Firebase Admin SDK o importación manual
const output = {
  partidos: partidos.reduce((acc, p) => {
    acc[p.id] = {
      ...p,
      fechaHora: p.fechaHora.toISOString(),
      cierrePronosticos: p.cierrePronosticos.toISOString(),
    };
    return acc;
  }, {}),
  fases: FASES.reduce((acc, f) => {
    acc[f.id] = {
      ...f,
      cierrePronosticos: f.cierrePronosticos ? f.cierrePronosticos.toISOString() : null,
    };
    return acc;
  }, {}),
};

console.log(JSON.stringify(output, null, 2));

console.log('\n=== INSTRUCCIONES ===');
console.log('1. Ve a Firebase Console → Firestore Database');
console.log('2. Crea la colección "partidos" e importa los documentos del JSON');
console.log('3. Crea la colección "fases" e importa los documentos del JSON');
console.log('4. O usa el Firebase Admin SDK para importar programáticamente');
console.log('\nAlternativa: usa la función seedFirestore() exportada abajo con el SDK web.\n');

// ============================================================
// Función para usar con el SDK web de Firebase (desde la consola del navegador)
// ============================================================
export { partidos, FASES, GRUPOS };
