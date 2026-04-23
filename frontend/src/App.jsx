// src/App.jsx
// Router principal de la SPA — protege rutas con auth check

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/Sales/SalesPage';
import NewSale from './pages/Sales/NewSale';
import InventoryPage from './pages/Inventory/InventoryPage';
import ProductsPage from './pages/Products/ProductsPage';
import UsersPage from './pages/Users/UsersPage';
import CustomersPage from './pages/Customers/CustomersPage';
import SuppliersPage from './pages/Suppliers/SuppliersPage';
import ReportsPage from './pages/Reports/ReportsPage';

// ── Ruta protegida ────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ── Layout con Sidebar ────────────────────────────────────────
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

// Páginas placeholder para módulos sin página propia aún
const PlaceholderPage = ({ title, icon }) => (
  <div className="page-content">
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-icon">{icon}</div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <p>Módulo en construcción</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1E2235',
            color: '#F0F2FF',
            border: '1px solid #2A2E4A',
            borderRadius: 10,
          },
          success: { iconTheme: { primary: '#2DD67B', secondary: '#fff' } },
          error: { iconTheme: { primary: '#FF6B6B', secondary: '#fff' } },
        }}
      />

      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protegidas — con sidebar */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/sales" element={
          <ProtectedRoute>
            <AppLayout>
              <SalesPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/sales/new" element={
          <ProtectedRoute>
            <AppLayout>
              <NewSale />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <AppLayout>
              <InventoryPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <AppLayout>
              <ProductsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute>
            <AppLayout>
              <CustomersPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/suppliers" element={
          <ProtectedRoute>
            <AppLayout>
              <SuppliersPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute>
            <AppLayout>
              <UsersPage />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
