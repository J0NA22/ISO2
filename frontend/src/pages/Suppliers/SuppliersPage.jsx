// src/pages/Suppliers/SuppliersPage.jsx
import { useState, useEffect } from 'react';
import { suppliersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', contactName: '', phone: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await suppliersAPI.list({ search: q, limit: 50 });
      setSuppliers(res.data);
    } catch {
      toast.error('Error cargando proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast.error('La empresa es requerida'); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactName: form.contactName || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
      };

      if (form.id) {
        await suppliersAPI.update(form.id, payload);
        toast.success('Proveedor actualizado');
      } else {
        await suppliersAPI.create(payload);
        toast.success('Proveedor registrado');
      }
      setShowForm(false);
      load(search);
    } catch {
      toast.error('Error guardando proveedor');
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = (supplier = null) => {
    if (supplier) {
      setForm({
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      });
    } else {
      setForm({ id: null, name: '', contactName: '', phone: '', email: '', address: '' });
    }
    setShowForm(true);
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Proveedores</h1>
          <p className="text-muted text-sm">{suppliers.length} proveedores registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          ➕ Nuevo Proveedor
        </button>
      </div>

      <div className="search-bar mb-4" style={{ maxWidth: '100%' }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nombre, contacto o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚚</div>
            <p>No hay proveedores</p>
            <button className="btn btn-primary" onClick={() => openForm()}>Registrar primer proveedor</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Contacto</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      {s.contactName && <div style={{ fontSize: 13, fontWeight: 500 }}>{s.contactName}</div>}
                      {s.phone && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📞 {s.phone}</div>}
                      {s.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>✉️ {s.email}</div>}
                      {!s.contactName && !s.phone && !s.email && <span className="text-muted text-sm">N/A</span>}
                    </td>
                    <td><span className="text-sm truncate" style={{ maxWidth: 200, display: 'inline-block' }}>{s.address || 'N/A'}</span></td>
                    <td><span className={s.isActive ? "badge badge-success" : "badge badge-error"}>{s.isActive ? "Activo" : "Inactivo"}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => openForm(s)} title="Editar">
                        ✏️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{form.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre de la Empresa *</label>
                  <input className="form-input" type="text" required maxLength={150}
                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nombre del Contacto</label>
                  <input className="form-input" type="text" maxLength={150}
                    value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" type="tel" maxLength={20}
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" maxLength={150}
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Dirección</label>
                  <textarea className="form-textarea" rows={2}
                    value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Guardando...' : 'Guardar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
