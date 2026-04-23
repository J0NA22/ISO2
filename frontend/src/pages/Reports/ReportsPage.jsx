// src/pages/Reports/ReportsPage.jsx
import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [tab, setTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  
  // Date filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Data
  const [salesReport, setSalesReport] = useState({ summary: {}, sales: [] });
  const [topProducts, setTopProducts] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'sales') {
        const res = await reportsAPI.sales({ startDate, endDate });
        setSalesReport(res.data || { summary: {}, sales: [] });
      } else if (tab === 'products') {
        const res = await reportsAPI.topProducts({ startDate, endDate, limit: 10 });
        setTopProducts(res.data || []);
      }
    } catch {
      toast.error('Error cargando el reporte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reportes Detallados</h1>
          <p className="text-muted text-sm">Analiza el rendimiento del negocio</p>
        </div>
      </div>

      <div className="card mb-6" style={{ padding: '16px' }}>
        <div className="grid-2" style={{ alignItems: 'end' }}>
          <div>
            <div className="flex" style={{ gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Fecha Inicio</label>
                <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 12 }}>Fecha Fin</label>
                <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={loadData} disabled={loading}>
              {loading ? 'Cargando...' : 'Filtrar Datos'}
            </button>
          </div>
        </div>
      </div>

      <div className="tabs mb-4" style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button 
          onClick={() => setTab('sales')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
            fontWeight: tab === 'sales' ? 600 : 400,
            color: tab === 'sales' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: tab === 'sales' ? '2px solid var(--primary)' : 'none'
          }}
        >
          📈 Ventas por Fecha
        </button>
        <button 
          onClick={() => setTab('products')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', cursor: 'pointer',
            fontWeight: tab === 'products' ? 600 : 400,
            color: tab === 'products' ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: tab === 'products' ? '2px solid var(--primary)' : 'none'
          }}
        >
          🏆 Productos más vendidos
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reporte...</div>
        ) : tab === 'sales' ? (
          <div>
            <div className="grid-3 mb-6" style={{ gap: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Ventas (Monto)</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>C$ {Number(salesReport.summary?.totalAmount || 0).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cantidad de Transacciones</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{salesReport.summary?.totalTransactions || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ticket Promedio</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>
                  C$ {salesReport.summary?.totalTransactions ? Number((salesReport.summary?.totalAmount || 0) / salesReport.summary.totalTransactions).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            {salesReport.sales?.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No se encontraron ventas en este rango de fechas.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>N° Ticket</th>
                      <th>Cliente</th>
                      <th>Atendió</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport.sales?.map((s) => (
                      <tr key={s.id}>
                        <td>{new Date(s.saleDate).toLocaleString()}</td>
                        <td style={{ fontFamily: 'monospace' }}>{s.saleNumber}</td>
                        <td>{s.customer?.fullName || <span className="text-muted">Consumidor Final</span>}</td>
                        <td>{s.user?.fullName}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>C$ {Number(s.total).toFixed(2)}</td>
                        <td>
                          <span className={s.status === 'COMPLETED' ? "badge badge-success" : s.status === 'CANCELLED' ? "badge badge-error" : "badge badge-purple"}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            {topProducts.length === 0 ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <p>No hay datos de productos para este rango de fechas.</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ranking</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th style={{ textAlign: 'right' }}>Cantidad Vendida</th>
                      <th style={{ textAlign: 'right' }}>Ingresos Generados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, index) => (
                      <tr key={p.productId || index}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{index + 1}</td>
                        <td style={{ fontWeight: 600 }}>{p.productName}</td>
                        <td><span className="badge badge-purple">{p.categoryName || 'N/A'}</span></td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{p.totalQuantity} ud.</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--success)' }}>
                          C$ {Number(p.totalRevenue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
