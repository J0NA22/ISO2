// App principal — Enrutamiento y layout
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/common/Sidebar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import ProvidersPage from './pages/ProvidersPage';
import CashRegisterPage from './pages/CashRegisterPage';
import SettingsPage from './pages/SettingsPage';

// Estilos
import './styles/index.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pos.css';
import './styles/pages.css';

// Layout con sidebar para rutas autenticadas
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        {children}
      </div>
    </div>
  );
}

// Componente que decide entre login y app
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />

      {/* Rutas protegidas con layout */}
      <Route path="/" element={<ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute><CartProvider><AppLayout><POSPage /></AppLayout></CartProvider></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><AppLayout><ProductsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><AppLayout><InventoryPage /></AppLayout></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><AppLayout><CustomersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={['admin','gerente']}><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={['admin']}><AppLayout><UsersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/providers" element={<ProtectedRoute roles={['admin','gerente']}><AppLayout><ProvidersPage /></AppLayout></ProtectedRoute>} />
      <Route path="/cash-register" element={<ProtectedRoute><AppLayout><CashRegisterPage /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute roles={['admin']}><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />

      {/* Ruta catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#333', color: '#fff', fontSize: '0.9rem' },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
