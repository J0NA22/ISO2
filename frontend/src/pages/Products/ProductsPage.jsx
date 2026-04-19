// src/pages/Products/ProductsPage.jsx
// Catálogo de productos con variantes

import { useState, useEffect } from 'react';
import { productsAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '', basePrice: '', barcode: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ search: q, status: 'ACTIVE', limit: 20 });
      setProducts(res.data);
      setMeta(res.meta);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    productsAPI.categories().then((r) => setCategories(r.data));
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.basePrice) {
      toast.error('Completa los campos requeridos'); return;
    }
    setSubmitting(true);
    try {
      await productsAPI.create({
        name: form.name.trim(),
        description: form.description || undefined,
        categoryId: parseInt(form.categoryId),
        basePrice: parseFloat(form.basePrice),
        barcode: form.barcode || undefined,
      });
      toast.success('Producto creado');
      setShowForm(false);
      setForm({ name: '', description: '', categoryId: '', basePrice: '', barcode: '' });
      load(search);
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Productos</h1>
          <p className="text-muted text-sm">{meta?.total || 0} productos activos</p>
        </div>
        <button id="new-product-btn" className="btn btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Producto
        </button>
      </div>

      {/* Búsqueda */}
      <div className="search-bar mb-4" style={{ maxWidth: '100%' }}>
        <span className="search-icon">🔍</span>
        <input
          id="product-search"
          type="text"
          placeholder="Buscar por nombre o código de barras..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No hay productos</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>Crear primer producto</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio Base</th>
                  <th>Variantes</th>
                  <th>Stock Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = p.variants?.reduce((s, v) => s + (v.stock?.quantity || 0), 0) || 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.barcode && <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{p.barcode}</div>}
                      </td>
                      <td><span className="badge badge-purple">{p.category?.name}</span></td>
                      <td style={{ fontWeight: 600 }}>C$ {Number(p.basePrice).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {p.variants?.slice(0, 4).map((v) => (
                            <span key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', fontSize: 11 }}>
                              <span className="color-dot" style={{ background: v.color?.hexCode, width: 8, height: 8 }} />
                              {v.size?.name}
                            </span>
                          ))}
                          {(p.variants?.length || 0) > 4 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{p.variants.length - 4}</span>}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{totalStock}</td>
                      <td><span className="badge badge-success">Activo</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear producto */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuevo Producto</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input id="product-name" className="form-input" type="text" required maxLength={200}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Categoría *</label>
                    <select id="product-category" className="form-select" required
                      value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                      <option value="">Selecciona...</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Precio Base (C$) *</label>
                    <input id="product-price" className="form-input" type="number" min="0.01" step="0.01" required
                      value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Código de Barras</label>
                  <input className="form-input" type="text" maxLength={50}
                    value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-textarea" rows={3} maxLength={1000}
                    value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button id="submit-product" type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
