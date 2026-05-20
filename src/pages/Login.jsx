import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/pronosticos');
    } catch (err) {
      console.error('Error de login:', err);
      const messages = {
        'auth/user-not-found': 'No existe una cuenta con este correo.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-email': 'Correo electrónico inválido.',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/invalid-credential': 'Credenciales inválidas. Verifica tu correo y contraseña.',
      };
      setError(messages[err.code] || 'Error al iniciar sesión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mundial flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-mundial-accent pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-fifa/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-dorado/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-2xl flex items-center justify-center">
            <img src="/logo-leon.png" alt="Papos Guate León" className="w-full h-full object-contain" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white mb-1">
            Quiniela Papos Guate
          </h1>
          <p className="text-dorado font-semibold text-sm tracking-widest uppercase">
            La Fiesta del Fútbol 2026
          </p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-pts/10 border border-error-pts/20 rounded-xl text-error-pts text-sm animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-white/60 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-white/60 mb-1.5">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="btn-login"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/registro" className="text-fifa hover:text-fifa-400 font-semibold transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-6">
          Quiniela Papos Guate © Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
