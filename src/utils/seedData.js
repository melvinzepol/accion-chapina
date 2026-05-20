import { doc, setDoc, deleteDoc, getDocs, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const T = (s) => Timestamp.fromDate(new Date(s));

const FASES = [
  { id:"grupos", nombre:"Fase de Grupos", descripcion:"72 partidos — 12 Grupos A al L", cierrePronosticos:T("2026-06-09T13:00:00-06:00"), estado:"abierta", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
  { id:"dieciseisavos", nombre:"Dieciseisavos de Final", descripcion:"16 partidos — Del 28 junio al 3 julio", cierrePronosticos:T("2026-06-26T13:00:00-06:00"), estado:"pendiente", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
  { id:"octavos", nombre:"Octavos de Final", descripcion:"8 partidos — Del 4 al 7 julio", cierrePronosticos:T("2026-07-02T11:00:00-06:00"), estado:"pendiente", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
  { id:"cuartos", nombre:"Cuartos de Final", descripcion:"4 partidos — Del 9 al 11 julio", cierrePronosticos:T("2026-07-07T14:00:00-06:00"), estado:"pendiente", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
  { id:"semifinal", nombre:"Semifinales", descripcion:"2 partidos — 14 y 15 julio", cierrePronosticos:T("2026-07-12T13:00:00-06:00"), estado:"pendiente", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
  { id:"final", nombre:"Gran Final + 3er Puesto", descripcion:"2 partidos — 18 y 19 julio", cierrePronosticos:T("2026-07-16T15:00:00-06:00"), estado:"pendiente", premioDescripcion:"", ganadorUid:null, ganadorNombre:null },
];

const P = (id,fase,grupo,ronda,eL,bL,eV,bV,fecha,estadio,sub) => ({
  id, fase, grupo:grupo||null, ronda:ronda||null, equipoLocal:eL, banderaLocal:bL,
  equipoVisitante:eV, banderaVisitante:bV, fechaHora:T(fecha), estadio,
  estado:"pendiente", resultadoLocal:null, resultadoVisitante:null, subFase:sub||null
});

const PARTIDOS = [
  // ===== GRUPO A =====
  P("P001","grupos","A",1,"MÉXICO","🇲🇽","SUDÁFRICA","🇿🇦","2026-06-11T13:00:00-06:00","Ciudad de México"),
  P("P002","grupos","A",1,"COREA del SUR","🇰🇷","REP. CHECA","🇨🇿","2026-06-11T20:00:00-06:00","Guadalajara"),
  P("P025","grupos","A",2,"REP. CHECA","🇨🇿","SUDÁFRICA","🇿🇦","2026-06-18T10:00:00-06:00","Atlanta"),
  P("P028","grupos","A",2,"MÉXICO","🇲🇽","COREA del SUR","🇰🇷","2026-06-18T19:00:00-06:00","Guadalajara"),
  P("P053","grupos","A",3,"REP. CHECA","🇨🇿","MÉXICO","🇲🇽","2026-06-24T19:00:00-06:00","Ciudad de México"),
  P("P054","grupos","A",3,"SUDÁFRICA","🇿🇦","COREA del SUR","🇰🇷","2026-06-24T19:00:00-06:00","Monterrey"),
  // ===== GRUPO B =====
  P("P003","grupos","B",1,"CANADÁ","🇨🇦","BOSNIA y HERZEG.","🇧🇦","2026-06-12T13:00:00-06:00","Toronto"),
  P("P005","grupos","B",1,"CATAR","🇶🇦","SUIZA","🇨🇭","2026-06-13T13:00:00-06:00","San Francisco"),
  P("P026","grupos","B",2,"SUIZA","🇨🇭","BOSNIA y HERZEG.","🇧🇦","2026-06-18T13:00:00-06:00","Los Angeles"),
  P("P027","grupos","B",2,"CANADÁ","🇨🇦","CATAR","🇶🇦","2026-06-18T16:00:00-06:00","Vancouver"),
  P("P049","grupos","B",3,"SUIZA","🇨🇭","CANADÁ","🇨🇦","2026-06-24T13:00:00-06:00","Vancouver"),
  P("P050","grupos","B",3,"BOSNIA y HERZEG.","🇧🇦","CATAR","🇶🇦","2026-06-24T13:00:00-06:00","Seattle"),
  // ===== GRUPO C =====
  P("P006","grupos","C",1,"BRASIL","🇧🇷","MARRUECOS","🇲🇦","2026-06-13T16:00:00-06:00","Nueva York/NJ"),
  P("P007","grupos","C",1,"HAITÍ","🇭🇹","ESCOCIA","🏴󠁧󠁢󠁳󠁣󠁴󠁿","2026-06-13T19:00:00-06:00","Boston"),
  P("P030","grupos","C",2,"ESCOCIA","🏴󠁧󠁢󠁳󠁣󠁴󠁿","MARRUECOS","🇲🇦","2026-06-19T16:00:00-06:00","Boston"),
  P("P031","grupos","C",2,"BRASIL","🇧🇷","HAITÍ","🇭🇹","2026-06-19T18:30:00-06:00","Filadelfia"),
  P("P051","grupos","C",3,"ESCOCIA","🏴󠁧󠁢󠁳󠁣󠁴󠁿","BRASIL","🇧🇷","2026-06-24T16:00:00-06:00","Miami"),
  P("P052","grupos","C",3,"MARRUECOS","🇲🇦","HAITÍ","🇭🇹","2026-06-24T16:00:00-06:00","Atlanta"),
  // ===== GRUPO D =====
  P("P004","grupos","D",1,"ESTADOS UNIDOS","🇺🇸","PARAGUAY","🇵🇾","2026-06-12T19:00:00-06:00","Los Angeles"),
  P("P008","grupos","D",1,"AUSTRALIA","🇦🇺","TURQUÍA","🇹🇷","2026-06-13T22:00:00-06:00","Vancouver"),
  P("P029","grupos","D",2,"ESTADOS UNIDOS","🇺🇸","AUSTRALIA","🇦🇺","2026-06-19T13:00:00-06:00","Seattle"),
  P("P032","grupos","D",2,"TURQUÍA","🇹🇷","PARAGUAY","🇵🇾","2026-06-19T21:00:00-06:00","San Francisco"),
  P("P059","grupos","D",3,"TURQUÍA","🇹🇷","ESTADOS UNIDOS","🇺🇸","2026-06-25T20:00:00-06:00","Los Angeles"),
  P("P060","grupos","D",3,"PARAGUAY","🇵🇾","AUSTRALIA","🇦🇺","2026-06-25T20:00:00-06:00","San Francisco"),
  // ===== GRUPO E =====
  P("P009","grupos","E",1,"ALEMANIA","🇩🇪","CURAZAO","🇨🇼","2026-06-14T11:00:00-06:00","Houston"),
  P("P011","grupos","E",1,"COSTA de MARFIL","🇨🇮","ECUADOR","🇪🇨","2026-06-14T17:00:00-06:00","Filadelfia"),
  P("P034","grupos","E",2,"ALEMANIA","🇩🇪","COSTA de MARFIL","🇨🇮","2026-06-20T14:00:00-06:00","Toronto"),
  P("P035","grupos","E",2,"ECUADOR","🇪🇨","CURAZAO","🇨🇼","2026-06-20T18:00:00-06:00","Kansas City"),
  P("P055","grupos","E",3,"CURAZAO","🇨🇼","COSTA de MARFIL","🇨🇮","2026-06-25T14:00:00-06:00","Filadelfia"),
  P("P056","grupos","E",3,"ECUADOR","🇪🇨","ALEMANIA","🇩🇪","2026-06-25T14:00:00-06:00","Nueva York/NJ"),
  // ===== GRUPO F =====
  P("P010","grupos","F",1,"PAÍSES BAJOS","🇳🇱","JAPÓN","🇯🇵","2026-06-14T14:00:00-06:00","Dallas"),
  P("P012","grupos","F",1,"SUECIA","🇸🇪","TÚNEZ","🇹🇳","2026-06-14T20:00:00-06:00","Monterrey"),
  P("P033","grupos","F",2,"PAÍSES BAJOS","🇳🇱","SUECIA","🇸🇪","2026-06-20T11:00:00-06:00","Houston"),
  P("P036","grupos","F",2,"TÚNEZ","🇹🇳","JAPÓN","🇯🇵","2026-06-20T22:00:00-06:00","Monterrey"),
  P("P057","grupos","F",3,"JAPÓN","🇯🇵","SUECIA","🇸🇪","2026-06-25T17:00:00-06:00","Dallas"),
  P("P058","grupos","F",3,"TÚNEZ","🇹🇳","PAÍSES BAJOS","🇳🇱","2026-06-25T17:00:00-06:00","Kansas City"),
  // ===== GRUPO G =====
  P("P014","grupos","G",1,"BÉLGICA","🇧🇪","EGIPTO","🇪🇬","2026-06-15T13:00:00-06:00","Seattle"),
  P("P016","grupos","G",1,"IRÁN","🇮🇷","NUEVA ZELANDA","🇳🇿","2026-06-15T19:00:00-06:00","Los Angeles"),
  P("P038","grupos","G",2,"BÉLGICA","🇧🇪","IRÁN","🇮🇷","2026-06-21T13:00:00-06:00","Los Angeles"),
  P("P040","grupos","G",2,"NUEVA ZELANDA","🇳🇿","EGIPTO","🇪🇬","2026-06-21T19:00:00-06:00","Vancouver"),
  P("P065","grupos","G",3,"EGIPTO","🇪🇬","IRÁN","🇮🇷","2026-06-26T21:00:00-06:00","Seattle"),
  P("P066","grupos","G",3,"NUEVA ZELANDA","🇳🇿","BÉLGICA","🇧🇪","2026-06-26T21:00:00-06:00","Vancouver"),
  // ===== GRUPO H =====
  P("P013","grupos","H",1,"ESPAÑA","🇪🇸","CABO VERDE","🇨🇻","2026-06-15T10:00:00-06:00","Atlanta"),
  P("P015","grupos","H",1,"ARABIA SAUDITA","🇸🇦","URUGUAY","🇺🇾","2026-06-15T16:00:00-06:00","Miami"),
  P("P037","grupos","H",2,"ESPAÑA","🇪🇸","ARABIA SAUDITA","🇸🇦","2026-06-21T10:00:00-06:00","Atlanta"),
  P("P039","grupos","H",2,"URUGUAY","🇺🇾","CABO VERDE","🇨🇻","2026-06-21T16:00:00-06:00","Miami"),
  P("P063","grupos","H",3,"CABO VERDE","🇨🇻","ARABIA SAUDITA","🇸🇦","2026-06-26T18:00:00-06:00","Houston"),
  P("P064","grupos","H",3,"URUGUAY","🇺🇾","ESPAÑA","🇪🇸","2026-06-26T18:00:00-06:00","Guadalajara"),
  // ===== GRUPO I =====
  P("P017","grupos","I",1,"FRANCIA","🇫🇷","SENEGAL","🇸🇳","2026-06-16T13:00:00-06:00","Nueva York/NJ"),
  P("P018","grupos","I",1,"IRAK","🇮🇶","NORUEGA","🇳🇴","2026-06-16T16:00:00-06:00","Boston"),
  P("P042","grupos","I",2,"FRANCIA","🇫🇷","IRAK","🇮🇶","2026-06-22T15:00:00-06:00","Filadelfia"),
  P("P043","grupos","I",2,"NORUEGA","🇳🇴","SENEGAL","🇸🇳","2026-06-22T18:00:00-06:00","Nueva York/NJ"),
  P("P061","grupos","I",3,"NORUEGA","🇳🇴","FRANCIA","🇫🇷","2026-06-26T13:00:00-06:00","Boston"),
  P("P062","grupos","I",3,"SENEGAL","🇸🇳","IRAK","🇮🇶","2026-06-26T13:00:00-06:00","Toronto"),
  // ===== GRUPO J =====
  P("P019","grupos","J",1,"ARGENTINA","🇦🇷","ARGELIA","🇩🇿","2026-06-16T19:00:00-06:00","Kansas City"),
  P("P020","grupos","J",1,"AUSTRIA","🇦🇹","JORDANIA","🇯🇴","2026-06-16T22:00:00-06:00","San Francisco"),
  P("P041","grupos","J",2,"ARGENTINA","🇦🇷","AUSTRIA","🇦🇹","2026-06-22T11:00:00-06:00","Dallas"),
  P("P044","grupos","J",2,"JORDANIA","🇯🇴","ARGELIA","🇩🇿","2026-06-22T21:00:00-06:00","San Francisco"),
  P("P071","grupos","J",3,"ARGELIA","🇩🇿","AUSTRIA","🇦🇹","2026-06-27T20:00:00-06:00","Kansas City"),
  P("P072","grupos","J",3,"JORDANIA","🇯🇴","ARGENTINA","🇦🇷","2026-06-27T20:00:00-06:00","Dallas"),
  // ===== GRUPO K =====
  P("P021","grupos","K",1,"PORTUGAL","🇵🇹","REP. del CONGO","🇨🇩","2026-06-17T11:00:00-06:00","Houston"),
  P("P024","grupos","K",1,"UZBEKISTÁN","🇺🇿","COLOMBIA","🇨🇴","2026-06-17T20:00:00-06:00","Ciudad de México"),
  P("P045","grupos","K",2,"PORTUGAL","🇵🇹","UZBEKISTÁN","🇺🇿","2026-06-23T11:00:00-06:00","Houston"),
  P("P048","grupos","K",2,"COLOMBIA","🇨🇴","REP. del CONGO","🇨🇩","2026-06-23T20:00:00-06:00","Guadalajara"),
  P("P069","grupos","K",3,"COLOMBIA","🇨🇴","PORTUGAL","🇵🇹","2026-06-27T17:30:00-06:00","Miami"),
  P("P070","grupos","K",3,"REP. del CONGO","🇨🇩","UZBEKISTÁN","🇺🇿","2026-06-27T17:30:00-06:00","Atlanta"),
  // ===== GRUPO L =====
  P("P022","grupos","L",1,"INGLATERRA","🏴󠁧󠁢󠁥󠁮󠁧󠁿","CROACIA","🇭🇷","2026-06-17T14:00:00-06:00","Dallas"),
  P("P023","grupos","L",1,"GHANA","🇬🇭","PANAMÁ","🇵🇦","2026-06-17T17:00:00-06:00","Toronto"),
  P("P046","grupos","L",2,"INGLATERRA","🏴󠁧󠁢󠁥󠁮󠁧󠁿","GHANA","🇬🇭","2026-06-23T14:00:00-06:00","Boston"),
  P("P047","grupos","L",2,"PANAMÁ","🇵🇦","CROACIA","🇭🇷","2026-06-23T17:00:00-06:00","Toronto"),
  P("P067","grupos","L",3,"PANAMÁ","🇵🇦","INGLATERRA","🏴󠁧󠁢󠁥󠁮󠁧󠁿","2026-06-27T15:00:00-06:00","Nueva York/NJ"),
  P("P068","grupos","L",3,"CROACIA","🇭🇷","GHANA","🇬🇭","2026-06-27T15:00:00-06:00","Filadelfia"),
  // ===== DIECISEISAVOS =====
  P("P073","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-28T13:00:00-06:00","Los Angeles"),
  P("P074","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-29T11:00:00-06:00","Houston"),
  P("P075","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-29T14:30:00-06:00","Boston"),
  P("P076","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-29T19:00:00-06:00","Monterrey"),
  P("P077","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-30T11:00:00-06:00","Dallas"),
  P("P078","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-30T15:00:00-06:00","Nueva York/NJ"),
  P("P079","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-06-30T19:00:00-06:00","Ciudad de México"),
  P("P080","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-01T10:00:00-06:00","Atlanta"),
  P("P081","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-01T14:00:00-06:00","Seattle"),
  P("P082","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-01T18:00:00-06:00","San Francisco"),
  P("P083","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-02T13:00:00-06:00","Los Angeles"),
  P("P084","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-02T17:00:00-06:00","Toronto"),
  P("P085","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-03T21:00:00-06:00","Vancouver"),
  P("P086","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-03T12:00:00-06:00","Dallas"),
  P("P087","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-03T16:00:00-06:00","Miami"),
  P("P088","dieciseisavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-03T19:30:00-06:00","Kansas City"),
  // ===== OCTAVOS =====
  P("P089","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-04T11:00:00-06:00","Houston"),
  P("P090","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-04T15:00:00-06:00","Filadelfia"),
  P("P091","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-05T14:00:00-06:00","Nueva York/NJ"),
  P("P092","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-05T18:00:00-06:00","Ciudad de México"),
  P("P093","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-06T13:00:00-06:00","Dallas"),
  P("P094","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-06T18:00:00-06:00","Seattle"),
  P("P095","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-07T10:00:00-06:00","Atlanta"),
  P("P096","octavos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-07T14:00:00-06:00","Vancouver"),
  // ===== CUARTOS =====
  P("P097","cuartos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-09T14:00:00-06:00","Boston"),
  P("P098","cuartos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-10T13:00:00-06:00","Los Angeles"),
  P("P099","cuartos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-11T15:00:00-06:00","Miami"),
  P("P100","cuartos",null,1,"TBD","🏳️","TBD","🏳️","2026-07-11T19:00:00-06:00","Kansas City"),
  // ===== SEMIFINALES =====
  P("P101","semifinal",null,1,"TBD","🏳️","TBD","🏳️","2026-07-14T13:00:00-06:00","Dallas"),
  P("P102","semifinal",null,1,"TBD","🏳️","TBD","🏳️","2026-07-15T13:00:00-06:00","Atlanta"),
  // ===== FINAL =====
  P("P103","final",null,1,"TBD","🏳️","TBD","🏳️","2026-07-18T15:00:00-06:00","Miami","tercerPuesto"),
  P("P104","final",null,1,"TBD","🏳️","TBD","🏳️","2026-07-19T13:00:00-06:00","Nueva York/NJ (MetLife Stadium)","final"),
];

export async function seedFirestore(onProgress) {
  const total = FASES.length + PARTIDOS.length;
  let current = 0;

  for (const fase of FASES) {
    const { id, ...data } = fase;
    await setDoc(doc(db, 'fases', id), data);
    current++;
    onProgress?.({ current, total, message: `Fase "${fase.nombre}" creada` });
  }

  for (const partido of PARTIDOS) {
    const { id, ...data } = partido;
    await setDoc(doc(db, 'partidos', id), data);
    current++;
    if (current % 10 === 0 || current === total) {
      onProgress?.({ current, total, message: `Partido ${current - FASES.length} de ${PARTIDOS.length}` });
    }
  }

  return { partidos: PARTIDOS.length, fases: FASES.length };
}

/**
 * Borra todos los partidos y fases existentes, luego carga los nuevos.
 */
export async function clearAndSeed(onProgress) {
  onProgress?.({ current: 0, total: 1, message: 'Borrando datos anteriores (partidos)...' });
  
  const collectionsToClear = ['partidos', 'fases', 'pronosticos', 'rankings', 'ganadores'];
  
  for (const collName of collectionsToClear) {
    onProgress?.({ current: 0, total: 1, message: `Limpiando ${collName}...` });
    const snap = await getDocs(collection(db, collName));
    for (const d of snap.docs) {
      await deleteDoc(doc(db, collName, d.id));
    }
  }
  
  onProgress?.({ current: 0, total: 1, message: 'Datos anteriores borrados. Cargando nuevos...' });
  
  return seedFirestore(onProgress);
}

export { FASES, PARTIDOS };
