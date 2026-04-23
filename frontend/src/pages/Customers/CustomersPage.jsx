// src/pages/Customers/CustomersPage.jsx
import { useState, useEffect } from 'react';
import { customersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ id: null, fullName: '', phone: '', email: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await customersAPI.list({ search: q, limit: 50 });
      setCustomers(res.data);
    } catch {
      toast.error('Error cargando clientes');
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
    if (!form.fullName) {
      toast.error('El nombre es requerido'); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
      };

      if (form.id) {
        await customersAPI.update(form.id, payload);
        toast.success('Cliente actualizado');
      } else {
        await customersAPI.create(payload);
        toast.success('Cliente registrado');
      }
      setShowForm(false);
      load(search);
    } catch {
      toast.error('Error guardando cliente');
    } finally {
      setSubmitting(false);
    }
  };

  const openForm = (customer = null) => {
    if (customer) {
      setForm({
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      });
    } else {
      setForm({ id: null, fullName: '', phone: '', email: '', address: '' });
    }
    setShowForm(true);
  };

  // Historial de compras
  const handleViewHistory = async (customer) => {
    setSelectedCustomer(customer);
    setShowHistory(true);
    try {
      const res = await customersAPI.purchaseHistory(customer.id);
      setHistory(res.data || []);
    } catch {
      toast.error('Error cargando historial');
      setHistory([]);
    }
  };

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Clientes</h1>
          <p className="text-muted text-sm">{customers.length} clientes registrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => openForm()}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Búsqueda */}
      <div className="search-bar mb-4" style={{ maxWidth: '100%' }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista */}
      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No hay clientes</p>
            <button className="btn btn-primary" onClick={() => openForm()}>Registrar primer cliente</button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Dirección</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.fullName}</td>
                    <td>
                      {c.phone && <div style={{ fontSize: 13 }}>📞 {c.phone}</div>}
                      {c.email && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>✉️ {c.email}</div>}
                      {!c.phone && !c.email && <span className="text-muted text-sm">N/A</span>}
                    </td>
                    <td><span className="text-sm truncate" style={{ maxWidth: 200, display: 'inline-block' }}>{c.address || 'N/A'}</span></td>
                    <td><span className={c.isActive ? "badge badge-success" : "badge badge-error"}>{c.isActive ? "Activo" : "Inactivo"}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-ghost btn-icon" onClick={() => handleViewHistory(c)} title="Ver Historial">
                        🛍️
                      </button>
                      <button className="btn btn-ghost btn-icon" onClick={() => openForm(c)} title="Editar">
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

      {/* Modal Formulario */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{form.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input className="form-input" type="text" required maxLength={200}
                    value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
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
                  {submitting ? 'Guardando...' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showHistory && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2>Historial: {selectedCustomer?.fullName}</h2>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="modal-body">
              {history.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}>
                  <p>Este cliente no tiene compras registradas.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>N° Ticket</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h.id}>
                          <td>{new Date(h.saleDate).toLocaleDateString()}</td>
                          <td style={{ fontFamily: 'monospace' }}>{h.saleNumber}</td>
                          <td style={{ fontWeight: 600 }}>C$ {Number(h.total).toFixed(2)}</td>
                          <td>
                            <span className={h.status === 'COMPLETED' ? "badge badge-success" : "badge badge-error"}>
                              {h.status === 'COMPLETED' ? 'Completada' : h.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
