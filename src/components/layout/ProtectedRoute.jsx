import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente wrapper para rutas protegidas.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.requireAdmin=false] - Requiere rol admin
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mundial">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-fifa/30 border-t-fifa rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/pronosticos" replace />;
  }

  return children;
}
