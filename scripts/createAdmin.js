/**
 * Script para crear un administrador en Firestore.
 *
 * Uso: node scripts/createAdmin.js
 *
 * NOTA: Este script se debe ejecutar después de que el usuario
 * ya se haya registrado normalmente en la app.
 *
 * Para asignar admin manualmente:
 * 1. Ve a Firebase Console → Firestore Database
 * 2. Busca la colección "participantes"
 * 3. Encuentra el documento del usuario por su email
 * 4. Agrega o cambia el campo "rol" a "admin"
 */

console.log('=== CREAR ADMINISTRADOR — Quiniela Mundial 2026 ===\n');
console.log('Para crear un administrador, sigue estos pasos:\n');
console.log('1. El usuario debe registrarse normalmente en la app');
console.log('2. Ve a Firebase Console → Firestore Database');
console.log('3. Abre la colección "participantes"');
console.log('4. Busca el documento del usuario (por email o nombre)');
console.log('5. Edita el documento y cambia el campo "rol" de "participante" a "admin"');
console.log('6. Guarda los cambios');
console.log('\nEl usuario tendrá acceso al panel de admin la próxima vez que inicie sesión.\n');
console.log('=== ALTERNATIVA: Firebase Admin SDK ===\n');
console.log('Si prefieres hacerlo programáticamente, instala firebase-admin:');
console.log('  npm install firebase-admin');
console.log('  Configura las credenciales de servicio y ejecuta:');
console.log(`
const admin = require('firebase-admin');
admin.initializeApp();

async function makeAdmin(email) {
  const db = admin.firestore();
  const snap = await db.collection('participantes')
    .where('email', '==', email)
    .get();
  
  if (snap.empty) {
    console.log('Usuario no encontrado');
    return;
  }

  const doc = snap.docs[0];
  await doc.ref.update({ rol: 'admin' });
  console.log('Admin asignado a:', doc.data().nombreCompleto);
}

makeAdmin(process.argv[2] || 'admin@example.com');
`);
