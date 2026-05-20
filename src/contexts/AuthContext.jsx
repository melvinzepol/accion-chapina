import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  query,
  where,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profileDoc = await getDoc(doc(db, 'participantes', firebaseUser.uid));
          if (profileDoc.exists()) {
            setProfile({ id: profileDoc.id, ...profileDoc.data() });
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('Error cargando perfil:', err);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /**
   * Registrar un nuevo participante.
   */
  async function register({ email, password, nombreCompleto, numeroCliente }) {
    // Verificar que el número de cliente no exista
    const q = query(collection(db, 'participantes'), where('numeroCliente', '==', numeroCliente));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('El número de cliente ya está registrado.');
    }

    // Crear usuario en Firebase Auth
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Guardar en Firestore
    const profileData = {
      uid: cred.user.uid,
      nombreCompleto,
      numeroCliente,
      email,
      fechaRegistro: serverTimestamp(),
      activo: true,
      rol: 'participante',
    };

    await setDoc(doc(db, 'participantes', cred.user.uid), profileData);
    setProfile({ id: cred.user.uid, ...profileData });

    return cred.user;
  }

  /**
   * Iniciar sesión.
   */
  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profileDoc = await getDoc(doc(db, 'participantes', cred.user.uid));
    if (profileDoc.exists()) {
      setProfile({ id: profileDoc.id, ...profileDoc.data() });
    }
    return cred.user;
  }

  /**
   * Cerrar sesión.
   */
  async function logout() {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  }

  const isAdmin = profile?.rol === 'admin';

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
