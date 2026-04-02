// Página de Clientes (RF16, RF17)
import { useState, useEffect } from 'react';
import { customerService } from '../services/dataService';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({ first_name:'', last_name:'', email:'', phone:'', address:'' });

  useEffect(() => { loadCustomers(); }, [search]);

  const loadCustomers = async () => {
    try {
      const res = await customerService.getAll({ search });
      setCustomers(res.data.data);
    } catch { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await customerService.update(selected.id, formData); toast.success('Cliente actualizado'); }
      else { await customerService.create(formData); toast.success('Cliente registrado'); }
      setShowForm(false);
      setFormData({ first_name:'', last_name:'', email:'', phone:'', address:'' });
      setEditing(false);
      loadCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const handleEdit = (c) => {
    setFormData({ first_name: c.first_name, last_name: c.last_name, email: c.email||'', phone: c.phone||'', address: c.address||'' });
    setSelected(c);
    setEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try { await customerService.delete(id); toast.success('Cliente eliminado'); loadCustomers(); }
    catch { toast.error('Error al eliminar'); }
  };

  const viewHistory = async (c) => {
    try {
      const res = await customerService.getPurchaseHistory(c.id);
      setHistory(res.data.data);
      setSelected(c);
      setShowHistory(true);
    } catch { toast.error('Error al cargar historial'); }
  };

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">👥 Clientes</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(false); setFormData({first_name:'',last_name:'',email:'',phone:'',address:''}); setShowForm(true); }}>
          <FiPlus /> Nuevo Cliente
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{flex:1}}>
          <FiSearch className="search-bar-icon" />
          <input className="form-input" placeholder="Buscar clientes..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:36}} />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th>Registrado</th><th>Acciones</th></tr></thead>
            <tbody>
              {customers.length === 0 ? (
                <tr><td colSpan="6" className="text-center text-muted" style={{padding:32}}>No hay clientes</td></tr>
              ) : customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.first_name} {c.last_name}</strong></td>
                  <td>{c.email || '-'}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.address || '-'}</td>
                  <td>{new Date(c.created_at).toLocaleDateString('es-NI')}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon btn-ghost" onClick={() => viewHistory(c)} title="Ver historial"><FiShoppingBag /></button>
                      <button className="btn-icon btn-ghost" onClick={() => handleEdit(c)} title="Editar"><FiEdit /></button>
                      <button className="btn-icon btn-ghost text-danger" onClick={() => handleDelete(c.id)} title="Eliminar"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre *</label><input className="form-input" value={formData.first_name} onChange={e=>setFormData({...formData, first_name:e.target.value})} required /></div>
            <div className="form-group"><label className="form-label">Apellido *</label><input className="form-input" value={formData.last_name} onChange={e=>setFormData({...formData, last_name:e.target.value})} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Dirección</label><input className="form-input" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} /></div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Guardar' : 'Registrar'}</button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title={`Historial — ${selected?.first_name} ${selected?.last_name}`} size="lg">
        {history.length === 0 ? <p className="text-center text-muted" style={{padding:32}}>No hay compras registradas</p> : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Nº Venta</th><th>Fecha</th><th>Total</th><th>Productos</th></tr></thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.sale_number}</strong></td>
                    <td>{new Date(h.created_at).toLocaleDateString('es-NI')}</td>
                    <td className="font-bold">{h.currency === 'USD' ? '$' : 'C$'}{parseFloat(h.total).toFixed(2)}</td>
                    <td>{h.items?.map((it,i) => <div key={i} className="text-muted" style={{fontSize:'0.8rem'}}>{it.quantity}x {it.product_name} ({it.size}/{it.color})</div>)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}
