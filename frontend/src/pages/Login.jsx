// src/pages/Login.jsx
// Página de login con validación y manejo seguro

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const validate = () => {
    const errs = {};
    if (!form.username || form.username.length < 3) errs.username = 'Usuario requerido (mín. 3 caracteres)';
    if (!form.password || form.password.length < 8) errs.password = 'Contraseña requerida (mín. 8 caracteres)';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const result = await authAPI.login(form);
      login(result.data.user, result.data.token);
      toast.success(`¡Bienvenido, ${result.data.user.fullName}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <div className="logo-badge">🛍️</div>
          <h1>POS System</h1>
          <p>Sistema de Ventas e Inventario</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Usuario</label>
            <input
              id="username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              type="text"
              placeholder="Tu nombre de usuario"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.trim() })}
              autoComplete="username"
              maxLength={50}
            />
            {errors.username && <p className="form-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              maxLength={128}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full btn-lg"
            style={{ marginTop: 8 }}
            disabled={loading}
          >
            {loading ? '⏳ Iniciando sesión...' : '🔐 Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
