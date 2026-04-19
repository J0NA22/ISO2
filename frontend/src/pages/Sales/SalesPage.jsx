// src/pages/Sales/SalesPage.jsx
// Lista de ventas con filtros y acceso al POS

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const statusLabels = {
  IN_PROGRESS: { label: '⏳ En curso', cls: 'badge-warning' },
  COMPLETED:   { label: '✅ Completada', cls: 'badge-success' },
  CANCELLED:   { label: '❌ Cancelada', cls: 'badge-danger' },
  PARTIAL_CANCEL: { label: '⚡ Parcial', cls: 'badge-info' },
};

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v !== ''));
      const res = await salesAPI.list(params);
      setSales(res.data);
      setMeta(res.meta);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters]);

  const formatCurrency = (n) => `C$ ${Number(n).toLocaleString('es-NI', { minimumFractionDigits: 2 })}`;

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Ventas</h1>
          <p className="text-muted text-sm">Historial de todas las transacciones</p>
        </div>
        <Link to="/sales/new" id="new-sale-btn" className="btn btn-primary">
          ➕ Nueva Venta
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-4 flex gap-3 items-center" style={{ flexWrap: 'wrap', padding: '12px 16px' }}>
        <select
          id="status-filter"
          className="form-select"
          style={{ width: 180 }}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="">Todos los estados</option>
          <option value="COMPLETED">Completadas</option>
          <option value="IN_PROGRESS">En curso</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
        {meta && <span className="text-muted text-sm">{meta.total} ventas</span>}
      </div>

      {/* Tabla */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : sales.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <p>No hay ventas registradas</p>
            <Link to="/sales/new" className="btn btn-primary">Registrar primera venta</Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => {
                  const st = statusLabels[s.status] || { label: s.status, cls: 'badge-gray' };
                  return (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {s.saleNumber}
                      </td>
                      <td>{s.customer?.fullName || <span className="text-muted">Consumidor final</span>}</td>
                      <td className="text-muted">{s.user?.fullName}</td>
                      <td style={{ fontWeight: 700 }}>{formatCurrency(s.total)}</td>
                      <td>
                        {s.payment && <span className="badge badge-info">{s.payment.method}</span>}
                      </td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td className="text-muted text-sm">{new Date(s.saleDate).toLocaleString('es-NI')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
            <span className="text-muted text-sm">Página {meta.page} de {meta.totalPages}</span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-sm" disabled={filters.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>← Anterior</button>
              <button className="btn btn-ghost btn-sm" disabled={filters.page >= meta.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Siguiente →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
