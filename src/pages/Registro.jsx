import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Registro() {
  const [form, setForm] = useState({
    nombreCompleto: '',
    numeroCliente: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!form.nombreCompleto.trim()) {
      setError('El nombre completo es requerido.');
      return;
    }
    if (!form.numeroCliente.trim()) {
      setError('El número de cliente es requerido.');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        nombreCompleto: form.nombreCompleto.trim(),
        numeroCliente: form.numeroCliente.trim(),
      });
      navigate('/pronosticos');
    } catch (err) {
      console.error('Error de registro:', err);
      const messages = {
        'auth/email-already-in-use': 'Ya existe una cuenta con este correo electrónico.',
        'auth/invalid-email': 'Correo electrónico inválido.',
        'auth/weak-password': 'La contraseña es muy débil. Usa al menos 6 caracteres.',
      };
      setError(err.message || messages[err.code] || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mundial flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mundial-accent pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-64 h-64 bg-fifa/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-64 h-64 bg-dorado/5 rounded-full blur-3xl" />

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

        {/* Form */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">Crear Cuenta</h2>

          {error && (
            <div className="mb-4 p-3 bg-error-pts/10 border border-error-pts/20 rounded-xl text-error-pts text-sm animate-slide-down">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="registro-nombre" className="block text-sm font-medium text-white/60 mb-1.5">
                Nombre completo
              </label>
              <input
                id="registro-nombre"
                type="text"
                value={form.nombreCompleto}
                onChange={handleChange('nombreCompleto')}
                className="input-field"
                placeholder="Juan Pérez"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="registro-cliente" className="block text-sm font-medium text-white/60 mb-1.5">
                Número de cliente
              </label>
              <input
                id="registro-cliente"
                type="text"
                value={form.numeroCliente}
                onChange={handleChange('numeroCliente')}
                className="input-field"
                placeholder="Ej: CLI-12345"
                required
              />
              <p className="text-[10px] text-white/30 mt-1">Este número vincula tu cuenta con tus premios</p>
            </div>

            <div>
              <label htmlFor="registro-email" className="block text-sm font-medium text-white/60 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="registro-email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                className="input-field"
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="registro-password" className="block text-sm font-medium text-white/60 mb-1.5">
                Contraseña
              </label>
              <input
                id="registro-password"
                type="password"
                value={form.password}
                onChange={handleChange('password')}
                className="input-field"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="registro-confirm" className="block text-sm font-medium text-white/60 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                id="registro-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange('confirmPassword')}
                className="input-field"
                placeholder="Repite la contraseña"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
              id="btn-registro"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Registrando...
                </>
              ) : (
                '🎯 Crear cuenta y participar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/40 text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-fifa hover:text-fifa-400 font-semibold transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Quiniela Papos Guate © Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
