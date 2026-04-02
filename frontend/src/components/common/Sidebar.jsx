// Componente Sidebar - Navegación principal de la aplicación
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiShoppingCart, FiPackage, FiArchive, FiUsers,
  FiBarChart2, FiSettings, FiTruck, FiDollarSign, FiLogOut, FiUserCheck
} from 'react-icons/fi';

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  const navItems = [
    { section: 'Principal', items: [
      { to: '/', icon: <FiHome />, label: 'Dashboard', roles: ['admin', 'gerente', 'vendedor'] },
      { to: '/pos', icon: <FiShoppingCart />, label: 'Punto de Venta', roles: ['admin', 'gerente', 'vendedor'] },
    ]},
    { section: 'Gestión', items: [
      { to: '/products', icon: <FiPackage />, label: 'Productos', roles: ['admin', 'gerente', 'vendedor'] },
      { to: '/inventory', icon: <FiArchive />, label: 'Inventario', roles: ['admin', 'gerente', 'vendedor'] },
      { to: '/customers', icon: <FiUsers />, label: 'Clientes', roles: ['admin', 'gerente', 'vendedor'] },
      { to: '/providers', icon: <FiTruck />, label: 'Proveedores', roles: ['admin', 'gerente'] },
    ]},
    { section: 'Finanzas', items: [
      { to: '/cash-register', icon: <FiDollarSign />, label: 'Caja', roles: ['admin', 'gerente', 'vendedor'] },
      { to: '/reports', icon: <FiBarChart2 />, label: 'Reportes', roles: ['admin', 'gerente'] },
    ]},
    { section: 'Sistema', items: [
      { to: '/users', icon: <FiUserCheck />, label: 'Usuarios', roles: ['admin'] },
      { to: '/settings', icon: <FiSettings />, label: 'Configuración', roles: ['admin'] },
    ]},
  ];

  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.jpg" alt="Zuleyka's Closet" className="sidebar-logo" />
        <div className="sidebar-brand">
          <h2>Zuleyka's Closet</h2>
          <span>Sistema POS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items
              .filter(item => item.roles.some(r => hasRole(r)))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive && (item.to === '/' ? location.pathname === '/' : true) ? 'active' : ''}`
                  }
                  end={item.to === '/'}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{getInitials()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.firstName} {user?.lastName}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="btn-icon btn-ghost" onClick={logout} title="Cerrar sesión">
            <FiLogOut />
          </button>
        </div>
      </div>
    </aside>
  );
}
