// Componente de ruta protegida — verifica autenticación y roles
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !hasRole(...roles)) {
    return (
      <div className="main-content">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2>🚫 Acceso Denegado</h2>
          <p className="text-muted mt-2">No tiene permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return children;
}
