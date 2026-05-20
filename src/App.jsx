import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Pronosticos from './pages/Pronosticos';
import Rankings from './pages/Rankings';
import Perfil from './pages/Perfil';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPartidos from './pages/admin/AdminPartidos';
import AdminFases from './pages/admin/AdminFases';
import AdminParticipantes from './pages/admin/AdminParticipantes';

// Cargar logos de patrocinadores dinámicamente
const sponsorImages = import.meta.glob('./assets/sponsors/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' });
const sponsorLogos = Object.values(sponsorImages);

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-mundial">
      <div className="fixed inset-0 bg-mundial-accent pointer-events-none z-0" />
      <div className="relative z-10">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex-1 pb-6">
            {children}
          </div>
          
          {/* Patrocinadores Footer */}
          <div className="w-full bg-noche/50 border-t border-white/5 py-6 mt-auto pb-[80px] md:pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <p className="text-center text-[10px] text-white/40 uppercase tracking-widest mb-4 font-semibold">
                Patrocinadores Oficiales
              </p>
              <div className="flex justify-center items-center gap-6 sm:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-300 flex-wrap">
                {sponsorLogos.length > 0 ? (
                  sponsorLogos.map((logoUrl, index) => (
                    <div key={index} className="h-8 md:h-10 flex items-center justify-center">
                      <img src={logoUrl} alt={`Patrocinador ${index + 1}`} className="max-h-full max-w-[120px] object-contain" />
                    </div>
                  ))
                ) : (
                  <>
                    <div className="h-8 w-24 bg-white/10 rounded-lg flex items-center justify-center text-[10px] text-white/30 font-bold">LOGO 1</div>
                    <div className="h-8 w-24 bg-white/10 rounded-lg flex items-center justify-center text-[10px] text-white/30 font-bold">LOGO 2</div>
                    <div className="h-8 w-24 bg-white/10 rounded-lg flex items-center justify-center text-[10px] text-white/30 font-bold">LOGO 3</div>
                    <div className="h-8 w-24 bg-white/10 rounded-lg hidden sm:flex items-center justify-center text-[10px] text-white/30 font-bold">LOGO 4</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mundial flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center">
            <img src="/logo-leon.png" alt="León" className="w-full h-full object-contain" />
          </div>
          <div className="w-8 h-8 border-3 border-fifa/30 border-t-fifa rounded-full animate-spin" />
          <p className="text-white/40 text-sm font-medium">Cargando Quiniela Papos Guate...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/pronosticos" replace /> : <Login />} />
      <Route path="/registro" element={user ? <Navigate to="/pronosticos" replace /> : <Registro />} />

      {/* Protected routes */}
      <Route
        path="/pronosticos"
        element={
          <ProtectedRoute>
            <AppLayout><Pronosticos /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rankings"
        element={
          <ProtectedRoute>
            <AppLayout><Rankings /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <AppLayout><Perfil /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AppLayout><AdminDashboard /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/partidos"
        element={
          <ProtectedRoute requireAdmin>
            <AppLayout><AdminPartidos /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/fases"
        element={
          <ProtectedRoute requireAdmin>
            <AppLayout><AdminFases /></AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/participantes"
        element={
          <ProtectedRoute requireAdmin>
            <AppLayout><AdminParticipantes /></AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={user ? '/pronosticos' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
