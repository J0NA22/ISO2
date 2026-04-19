// src/pages/Inventory/InventoryPage.jsx
// Vista de inventario con stock y alertas

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../../api/endpoints';

export default function InventoryPage() {
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('stock'); // 'stock' | 'alerts' | 'entries'

  useEffect(() => {
    Promise.all([
      inventoryAPI.getStock(),
      inventoryAPI.getLowStockAlerts(),
    ]).then(([stockRes, alertsRes]) => {
      setStock(stockRes.data);
      setAlerts(alertsRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const getStockBadge = (qty, threshold) => {
    if (qty === 0) return <span className="badge badge-danger">Sin stock</span>;
    if (qty <= threshold) return <span className="badge badge-warning">Stock bajo</span>;
    return <span className="badge badge-success">En stock</span>;
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Inventario</h1>
          <p className="text-muted text-sm">Control de stock y entradas de mercadería</p>
        </div>
        <div className="flex gap-3">
          {alerts.length > 0 && (
            <span className="badge badge-warning" style={{ padding: '8px 12px' }}>
              ⚠️ {alerts.length} alertas
            </span>
          )}
          <Link to="/inventory/new-entry" className="btn btn-primary">➕ Nueva Entrada</Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { id: 'stock', label: '📦 Stock Actual' },
          { id: 'alerts', label: `⚠️ Alertas (${alerts.length})` },
          { id: 'entries', label: '📋 Entradas' },
        ].map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            className={`btn ${view === t.id ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setView(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Cargando inventario...
        </div>
      ) : (
        <div className="card">
          {view === 'stock' && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Talla</th>
                    <th>Color</th>
                    <th>Stock</th>
                    <th>Umbral</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent-primary)', fontSize: 12 }}>
                        {s.variant?.sku}
                      </td>
                      <td style={{ fontWeight: 500 }}>{s.variant?.product?.name}</td>
                      <td className="text-muted text-sm">{s.variant?.product?.category?.name}</td>
                      <td><span className="badge badge-info">{s.variant?.size?.name}</span></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="color-dot" style={{ background: s.variant?.color?.hexCode }} />
                          {s.variant?.color?.name}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 16 }}>{s.quantity}</td>
                      <td className="text-muted">{s.variant?.minThreshold}</td>
                      <td>{getStockBadge(s.quantity, s.variant?.minThreshold)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stock.length === 0 && (
                <div className="empty-state"><div className="empty-icon">📦</div><p>Sin registros de stock</p></div>
              )}
            </div>
          )}

          {view === 'alerts' && (
            alerts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <p>No hay alertas de stock bajo</p>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>SKU</th><th>Producto</th><th>Talla</th><th>Color</th><th>Stock Actual</th><th>Umbral Mínimo</th></tr>
                  </thead>
                  <tbody>
                    {alerts.map((a, i) => (
                      <tr key={i} style={{ background: a.quantity === 0 ? 'rgba(255,107,107,0.05)' : undefined }}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--accent-danger)', fontSize: 12 }}>{a.sku}</td>
                        <td style={{ fontWeight: 500 }}>{a.product_name}</td>
                        <td><span className="badge badge-info">{a.size_name}</span></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="color-dot" style={{ background: a.hex_code }} />
                            {a.color_name}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: a.quantity === 0 ? 'var(--accent-danger)' : 'var(--accent-warning)' }}>
                          {Number(a.quantity)}
                        </td>
                        <td className="text-muted">{Number(a.min_threshold)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {view === 'entries' && <EntriesTab />}
        </div>
      )}
    </div>
  );
}

// Sub-componente de entradas de inventario
function EntriesTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryAPI.listEntries()
      .then((r) => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>;

  return entries.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <p>No hay entradas de inventario</p>
      <Link to="/inventory/new-entry" className="btn btn-primary">Registrar primera entrada</Link>
    </div>
  ) : (
    <div className="table-container">
      <table>
        <thead>
          <tr><th>#</th><th>Proveedor</th><th>Registrado por</th><th>Costo Total</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td style={{ fontFamily: 'monospace', color: 'var(--accent-secondary)', fontWeight: 600 }}>{e.entryNumber}</td>
              <td>{e.supplier?.name}</td>
              <td className="text-muted">{e.user?.fullName}</td>
              <td style={{ fontWeight: 600 }}>C$ {Number(e.totalCost).toLocaleString('es-NI', { minimumFractionDigits: 2 })}</td>
              <td className="text-muted text-sm">{new Date(e.entryDate).toLocaleString('es-NI')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
