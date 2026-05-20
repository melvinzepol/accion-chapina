import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-noche/80 backdrop-blur-xl border-b-[3px] border-transparent" style={{ borderBottomImage: 'linear-gradient(to right, #ff0000, #ffff00, #008000) 1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/pronosticos'} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo-leon.png" alt="Papos Guate León" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-white leading-tight">
                Quiniela Papos Guate
              </h1>
              <p className="text-[10px] font-semibold text-dorado tracking-widest uppercase">
                La Fiesta del Fútbol 2026
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/pronosticos"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Pronósticos
            </Link>
            <Link
              to="/rankings"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Rankings
            </Link>
            <Link
              to="/perfil"
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              Mi Perfil
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm font-medium text-dorado hover:text-dorado-400 hover:bg-dorado/5 rounded-lg transition-all"
              >
                ⚙ Admin
              </Link>
            )}
          </nav>

          {/* User info + logout */}
          <div className="flex items-center gap-3">
            {profile && (
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-white truncate max-w-[150px]">
                  {profile.nombreCompleto}
                </p>
                <p className="text-[11px] text-white/40">
                  {isAdmin ? '👑 Admin' : `#${profile.numeroCliente}`}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-fifa hover:bg-white/5 rounded-lg transition-all"
              title="Cerrar sesión"
              id="btn-logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
