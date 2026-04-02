// Página de Proveedores (RF33)
import { useState, useEffect } from 'react';
import { providerService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProvidersPage() {
  const { hasRole } = useAuth();
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '', contact_name: '', email: '', phone: '', address: ''
  });

  useEffect(() => { loadProviders(); }, [search]);

  const loadProviders = async () => {
    try {
      const res = await providerService.getAll({ search });
      setProviders(res.data.data);
    } catch { toast.error('Error al cargar'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await providerService.update(selected.id, formData);
        toast.success('Proveedor actualizado');
      } else {
        await providerService.create(formData);
        toast.success('Proveedor creado');
      }
      setShowForm(false);
      loadProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    try {
      await providerService.delete(id);
      toast.success('Eliminado');
      loadProviders();
    } catch { toast.error('Error'); }
  };

  const viewProducts = async (p) => {
    try {
      const res = await providerService.getProducts(p.id);
      setProducts(res.data.data);
      setSelected(p);
      setShowProducts(true);
    } catch { toast.error('Error'); }
  };

  const openEdit = (p) => {
    setEditing(true);
    setSelected(p);
    setFormData({
      company_name: p.company_name,
      contact_name: p.contact_name || '',
      email: p.email || '',
      phone: p.phone || '',
      address: p.address || '',
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(false);
    setFormData({ company_name: '', contact_name: '', email: '', phone: '', address: '' });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">🚚 Proveedores</h1>
        {hasRole('admin', 'gerente') && (
          <button className="btn btn-primary" onClick={openNew}>
            <FiPlus /> Nuevo Proveedor
          </button>
        )}
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <FiSearch className="search-bar-icon" />
          <input
            className="form-input"
            placeholder="Buscar proveedores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contacto</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted" style={{ padding: 32 }}>
                    Sin proveedores registrados
                  </td>
                </tr>
              ) : (
                providers.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.company_name}</strong></td>
                    <td>{p.contact_name || '-'}</td>
                    <td>{p.email || '-'}</td>
                    <td>{p.phone || '-'}</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn-icon btn-ghost" onClick={() => viewProducts(p)} title="Ver productos">
                          <FiPackage />
                        </button>
                        {hasRole('admin', 'gerente') && (
                          <button className="btn-icon btn-ghost" onClick={() => openEdit(p)}>
                            <FiEdit />
                          </button>
                        )}
                        {hasRole('admin') && (
                          <button className="btn-icon btn-ghost text-danger" onClick={() => handleDelete(p.id)}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Formulario */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre de Empresa *</label>
            <input className="form-input" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contacto</label>
            <input className="form-input" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Dirección</label>
            <input className="form-input" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Productos del proveedor */}
      <Modal isOpen={showProducts} onClose={() => setShowProducts(false)} title={`Productos — ${selected?.company_name}`} size="lg">
        {products.length === 0 ? (
          <p className="text-center text-muted" style={{ padding: 32 }}>Sin productos asociados</p>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock Total</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category || '-'}</td>
                  <td>C${parseFloat(p.sale_price).toFixed(2)}</td>
                  <td>{p.total_stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
