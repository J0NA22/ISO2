// src/pages/Reports/ReportsPage.jsx
// Reportes con visualizaciones Recharts — barras de ventas y top productos

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { reportsAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const COLORS = ['#7F5AF0', '#2DD67B', '#FF6B6B', '#FFBE0B', '#00B4D8', '#F72585'];

const fmt = (n) => `C$ ${Number(n || 0).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`;

// Tooltip personalizado para gráficas de ventas
const SalesTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1E2235', border: '1px solid #2A2E4A', borderRadius: 8, padding: '8px 12px' }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: '#F0F2FF' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill, margin: 0, fontSize: 13 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [tab, setTab] = useState('sales');
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [salesReport, setSalesReport] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryReport, setInventoryReport] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'sales') {
        const res = await reportsAPI.sales({ from: startDate, to: endDate });
        setSalesReport(res.data || null);
      } else if (tab === 'products') {
        const res = await reportsAPI.topProducts({ from: startDate, to: endDate, limit: 10 });
        setTopProducts(res.data || []);
      } else if (tab === 'inventory') {
        const res = await reportsAPI.inventory();
        setInventoryReport(res.data || null);
      }
    } catch {
      toast.error('Error cargando el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Datos para el gráfico de métodos de pago (PieChart)
  const paymentData = salesReport
    ? Object.entries(salesReport.byPaymentMethod || {}).map(([method, total]) => ({ name: method, value: total }))
    : [];

  const tabs = [
    { key: 'sales',     label: '📈 Ventas por Fecha' },
    { key: 'products',  label: '🏆 Más Vendidos' },
    { key: 'inventory', label: '📦 Inventario' },
  ];

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reportes</h1>
          <p className="text-muted text-sm">Análisis del rendimiento del negocio</p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="card mb-4" style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Fecha Inicio</label>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="form-label" style={{ fontSize: 12 }}>Fecha Fin</label>
            <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={loadData} disabled={loading}>
            {loading ? 'Cargando...' : '🔍 Aplicar Filtro'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
              fontWeight: tab === t.key ? 700 : 400,
              color: tab === t.key ? 'var(--accent-primary)' : 'var(--text-muted)',
              borderBottom: tab === t.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
              fontSize: 14, transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
          <p>Generando reporte...</p>
        </div>
      ) : (

        // ── TAB: VENTAS ────────────────────────────────────────────
        tab === 'sales' ? (
          <div>
            {salesReport && (
              <>
                {/* KPIs */}
                <div className="stats-grid mb-6">
                  <div className="stat-card">
                    <div className="stat-icon green">💰</div>
                    <div>
                      <div className="stat-value">{fmt(salesReport.totalRevenue)}</div>
                      <div className="stat-label">Ingresos totales</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon purple">🛒</div>
                    <div>
                      <div className="stat-value">{salesReport.totalSales}</div>
                      <div className="stat-label">Ventas completadas</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon teal">📋</div>
                    <div>
                      <div className="stat-value">{fmt(salesReport.totalTax)}</div>
                      <div className="stat-label">Impuestos recaudados</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon orange">🏷️</div>
                    <div>
                      <div className="stat-value">{fmt(salesReport.totalDiscount)}</div>
                      <div className="stat-label">Descuentos aplicados</div>
                    </div>
                  </div>
                </div>

                {/* Gráfico PieChart — método de pago */}
                {paymentData.length > 0 && (
                  <div className="card mb-4" style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Distribución por Método de Pago</h3>
                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
                      <ResponsiveContainer width={280} height={220}>
                        <PieChart>
                          <Pie
                            data={paymentData}
                            cx="50%" cy="50%"
                            innerRadius={60} outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {paymentData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => fmt(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div>
                        {paymentData.map((d, i) => (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, minWidth: 100 }}>{d.name}</span>
                            <span className="text-muted">{fmt(d.value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            {!salesReport && (
              <div className="card">
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-icon">📈</div>
                  <p>No se encontraron ventas en este rango de fechas.</p>
                </div>
              </div>
            )}
          </div>

        // ── TAB: TOP PRODUCTOS ────────────────────────────────────
        ) : tab === 'products' ? (
          <div>
            {topProducts.length === 0 ? (
              <div className="card">
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-icon">🏆</div>
                  <p>No hay datos de productos para este rango.</p>
                </div>
              </div>
            ) : (
              <>
                {/* BarChart horizontal */}
                <div className="card mb-4" style={{ padding: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Productos más vendidos (unidades)</h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={topProducts.slice(0, 8).map((p) => ({
                        name: p.product?.length > 18 ? p.product.slice(0, 18) + '…' : p.product,
                        Unidades: p.totalQuantity,
                        Ingresos: Number(p.totalRevenue),
                      }))}
                      margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2E4A" />
                      <XAxis dataKey="name" angle={-30} textAnchor="end" tick={{ fill: '#8A8FAB', fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fill: '#8A8FAB', fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8A8FAB', fontSize: 11 }} />
                      <Tooltip content={<SalesTooltip />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Unidades" fill="#7F5AF0" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="Ingresos" fill="#2DD67B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabla ranking */}
                <div className="card">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Producto</th>
                          <th>SKU</th>
                          <th>Talla / Color</th>
                          <th style={{ textAlign: 'right' }}>Unidades</th>
                          <th style={{ textAlign: 'right' }}>Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={p.variantId || i}>
                            <td style={{ fontWeight: 700, color: i < 3 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>#{i + 1}</td>
                            <td style={{ fontWeight: 600 }}>{p.product}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                            <td><span className="text-muted">{p.size} / {p.color}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{p.totalQuantity}</td>
                            <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>{fmt(p.totalRevenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

        // ── TAB: INVENTARIO ──────────────────────────────────────
        ) : (
          <div>
            {inventoryReport && (
              <>
                <div className="stats-grid mb-4">
                  <div className="stat-card">
                    <div className="stat-icon teal">📦</div>
                    <div>
                      <div className="stat-value">{inventoryReport.totalVariants}</div>
                      <div className="stat-label">Variantes en catálogo</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon green">🔢</div>
                    <div>
                      <div className="stat-value">{inventoryReport.totalUnits}</div>
                      <div className="stat-label">Unidades en stock</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon orange">⚠️</div>
                    <div>
                      <div className="stat-value">{inventoryReport.lowStockCount}</div>
                      <div className="stat-label">Stock bajo umbral</div>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon danger">❌</div>
                    <div>
                      <div className="stat-value">{inventoryReport.outOfStockCount}</div>
                      <div className="stat-label">Sin stock</div>
                    </div>
                  </div>
                </div>

                {/* Gráfico distribución de stock */}
                {inventoryReport.items?.length > 0 && (
                  <div className="card mb-4" style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Stock por variante (top 10 con mayor stock)</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={[...inventoryReport.items]
                          .sort((a, b) => b.quantity - a.quantity)
                          .slice(0, 10)
                          .map((it) => ({
                            name: `${it.variant?.product?.name?.slice(0, 12)} ${it.variant?.size?.name}`,
                            Stock: it.quantity,
                            Mínimo: it.variant?.minThreshold,
                          }))
                        }
                        margin={{ top: 5, right: 20, left: 10, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2E4A" />
                        <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fill: '#8A8FAB', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#8A8FAB', fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Stock" fill="#7F5AF0" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Mínimo" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
            {!inventoryReport && (
              <div className="card">
                <div className="empty-state" style={{ padding: 40 }}>
                  <div className="empty-icon">📦</div>
                  <p>No hay datos de inventario disponibles.</p>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
