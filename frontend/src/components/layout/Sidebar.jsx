// src/components/layout/Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { authAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const navItems = [
  { icon: '📊', label: 'Dashboard', path: '/dashboard' },
  { icon: '🛒', label: 'Ventas', path: '/sales' },
  { icon: '📦', label: 'Inventario', path: '/inventory' },
  { icon: '🏷️', label: 'Productos', path: '/products' },
  { icon: '👥', label: 'Clientes', path: '/customers' },
  { icon: '🚚', label: 'Proveedores', path: '/suppliers' },
  { icon: '📈', label: 'Reportes', path: '/reports' },
  { icon: '⚙️', label: 'Usuarios', path: '/users' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🛍️</div>
        <h1>POS System</h1>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Módulos</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName}
            </div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button
            id="logout-btn"
            className="btn btn-icon btn-ghost btn-sm"
            onClick={handleLogout}
            title="Cerrar sesión"
          >🚪</button>
        </div>
      </div>
    </nav>
  );
}
