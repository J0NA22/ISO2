// src/pages/Dashboard.jsx
// Dashboard principal con KPIs y ventas recientes

import { useState, useEffect } from 'react';
import { reportsAPI } from '../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ icon, value, label, colorClass, prefix = '' }) => (
  <div className="stat-card">
    <div className={`stat-icon ${colorClass}`}>{icon}</div>
    <div>
      <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString('es-NI') : value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsAPI.dashboard()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n) => `C$ ${Number(n || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="page-content">
        <div className="stats-grid">
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 88 }} />)}
        </div>
      </div>
    );
  }

  const recentSales = stats?.recentSales || [];

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Dashboard</h1>
        <p className="text-muted text-sm">Resumen del día — {new Date().toLocaleDateString('es-NI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPIs */}
      <div className="stats-grid">
        <StatCard icon="💰" value={formatCurrency(stats?.todayRevenue)} label="Ventas de hoy" colorClass="green" />
        <StatCard icon="🛒" value={stats?.todaySalesCount || 0} label="Transacciones hoy" colorClass="purple" />
        <StatCard icon="📦" value={stats?.totalActiveProducts || 0} label="Productos activos" colorClass="teal" />
        <StatCard icon="⚠️" value={stats?.lowStockAlerts || 0} label="Alertas de stock bajo" colorClass="orange" />
      </div>

      {/* Tabla de ventas recientes */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Ventas Recientes</h2>
          <a href="/sales" className="btn btn-ghost btn-sm">Ver todas →</a>
        </div>
        {recentSales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>No hay ventas recientes</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{s.saleNumber}</td>
                    <td>{s.customer?.fullName || <span className="text-muted">Consumidor final</span>}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(s.total)}</td>
                    <td>
                      <span className={`badge ${s.status === 'COMPLETED' ? 'badge-success' : s.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {s.status === 'COMPLETED' ? '✅ Completada' : s.status === 'CANCELLED' ? '❌ Cancelada' : '⏳ En curso'}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{new Date(s.saleDate).toLocaleString('es-NI')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
