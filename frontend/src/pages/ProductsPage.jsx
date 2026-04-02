// Página de Productos (RF7, RF8, RF9, RF13, RF14)
import { useState, useEffect } from 'react';
import { productService, providerService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const { hasRole } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ name:'', description:'', category:'', barcode:'', base_price:'', sale_price:'', provider_id:'' });
  const [variantData, setVariantData] = useState({ size:'', color:'', barcode:'', min_stock: 5 });
  const [editing, setEditing] = useState(false);

  useEffect(() => { loadData(); }, [search, category]);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getAll({ search, category: category || undefined }),
        productService.getCategories(),
      ]);
      setProducts(prodRes.data.data);
      setCategories(catRes.data.data);
    } catch { toast.error('Error al cargar productos'); }
    finally { setLoading(false); }
  };

  const loadProviders = async () => {
    try { const res = await providerService.getAll(); setProviders(res.data.data); }
    catch { /* ignorar */ }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await productService.update(selectedProduct.id, formData);
        toast.success('Producto actualizado');
      } else {
        await productService.create(formData);
        toast.success('Producto creado');
      }
      setShowForm(false);
      resetForm();
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al guardar'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await productService.delete(id);
      toast.success('Producto eliminado');
      loadData();
    } catch { toast.error('Error al eliminar'); }
  };

  const handleViewDetail = async (id) => {
    try {
      const res = await productService.getById(id);
      setSelectedProduct(res.data.data);
      setShowDetail(true);
    } catch { toast.error('Error al cargar detalles'); }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name, description: product.description || '', category: product.category || '',
      barcode: product.barcode || '', base_price: product.base_price, sale_price: product.sale_price,
      provider_id: product.provider_id || '',
    });
    setSelectedProduct(product);
    setEditing(true);
    loadProviders();
    setShowForm(true);
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    try {
      await productService.createVariant(selectedProduct.id, variantData);
      toast.success('Variante creada');
      setShowVariantForm(false);
      setVariantData({ size:'', color:'', barcode:'', min_stock: 5 });
      handleViewDetail(selectedProduct.id);
    } catch (err) { toast.error(err.response?.data?.message || 'Error al crear variante'); }
  };

  const resetForm = () => {
    setFormData({ name:'', description:'', category:'', barcode:'', base_price:'', sale_price:'', provider_id:'' });
    setEditing(false);
    setSelectedProduct(null);
  };

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">📦 Productos</h1>
        <div className="page-actions">
          {hasRole('admin','gerente') && (
            <button className="btn btn-primary" onClick={() => { resetForm(); loadProviders(); setShowForm(true); }}>
              <FiPlus /> Nuevo Producto
            </button>
          )}
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{flex:1}}>
          <FiSearch className="search-bar-icon" />
          <input className="form-input" placeholder="Buscar productos..." value={search} onChange={e => setSearch(e.target.value)} style={{paddingLeft:36}} />
        </div>
        <select className="form-select" value={category} onChange={e => setCategory(e.target.value)} style={{width:200}}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th><th>Categoría</th><th>Precio Costo</th><th>Precio Venta</th>
                <th>Variantes</th><th>Stock Total</th><th>Proveedor</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-muted" style={{padding:32}}>No hay productos registrados</td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong>{p.barcode && <div className="text-muted" style={{fontSize:'0.75rem'}}>{p.barcode}</div>}</td>
                  <td><span className="badge badge-primary">{p.category || '-'}</span></td>
                  <td>C${parseFloat(p.base_price).toFixed(2)}</td>
                  <td className="font-bold">C${parseFloat(p.sale_price).toFixed(2)}</td>
                  <td>{p.variant_count}</td>
                  <td><span className={p.total_stock <= 5 ? 'text-danger font-bold' : ''}>{p.total_stock}</span></td>
                  <td>{p.provider_name || '-'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn-icon btn-ghost" onClick={() => handleViewDetail(p.id)} title="Ver detalle"><FiEye /></button>
                      {hasRole('admin','gerente') && <button className="btn-icon btn-ghost" onClick={() => handleEdit(p)} title="Editar"><FiEdit /></button>}
                      {hasRole('admin') && <button className="btn-icon btn-ghost text-danger" onClick={() => handleDelete(p.id)} title="Eliminar"><FiTrash2 /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar producto */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editing ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name:e.target.value})} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <input className="form-input" value={formData.category} onChange={e => setFormData({...formData, category:e.target.value})} placeholder="Ej: Blusas, Vestidos..." />
            </div>
            <div className="form-group">
              <label className="form-label">Código de Barras</label>
              <input className="form-input" value={formData.barcode} onChange={e => setFormData({...formData, barcode:e.target.value})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio Costo *</label>
              <input type="number" className="form-input" value={formData.base_price} onChange={e => setFormData({...formData, base_price:e.target.value})} min="0" step="0.01" required />
            </div>
            <div className="form-group">
              <label className="form-label">Precio Venta *</label>
              <input type="number" className="form-input" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price:e.target.value})} min="0" step="0.01" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Proveedor</label>
            <select className="form-select" value={formData.provider_id} onChange={e => setFormData({...formData, provider_id:e.target.value})}>
              <option value="">Sin proveedor</option>
              {providers.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-input" rows="2" value={formData.description} onChange={e => setFormData({...formData, description:e.target.value})} />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Producto'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal detalle con variantes */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={selectedProduct?.name || 'Detalle'} size="lg">
        {selectedProduct && (
          <div>
            <div className="form-row mb-3">
              <div><strong>Categoría:</strong> {selectedProduct.category || '-'}</div>
              <div><strong>Precio:</strong> C${parseFloat(selectedProduct.sale_price).toFixed(2)}</div>
              <div><strong>Proveedor:</strong> {selectedProduct.provider_name || '-'}</div>
            </div>

            <div className="flex-between mb-2">
              <h3 style={{fontSize:'1rem'}}>Variantes ({selectedProduct.variants?.length || 0})</h3>
              {hasRole('admin','gerente') && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowVariantForm(true)}>
                  <FiPlus /> Agregar Variante
                </button>
              )}
            </div>

            <div className="table-container">
              <table className="table">
                <thead><tr><th>Talla</th><th>Color</th><th>SKU</th><th>Stock</th><th>Mín. Stock</th><th>Estado</th></tr></thead>
                <tbody>
                  {(selectedProduct.variants || []).map(v => (
                    <tr key={v.id}>
                      <td><strong>{v.size}</strong></td>
                      <td>{v.color}</td>
                      <td className="text-muted">{v.sku}</td>
                      <td className={v.stock <= v.min_stock ? 'text-danger font-bold' : ''}>{v.stock}</td>
                      <td>{v.min_stock}</td>
                      <td><span className={`badge ${v.stock > v.min_stock ? 'badge-success' : v.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {v.stock > v.min_stock ? 'Normal' : v.stock > 0 ? 'Stock Bajo' : 'Agotado'}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal agregar variante */}
      <Modal isOpen={showVariantForm} onClose={() => setShowVariantForm(false)} title="Nueva Variante">
        <form onSubmit={handleAddVariant}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Talla *</label>
              <input className="form-input" value={variantData.size} onChange={e => setVariantData({...variantData, size:e.target.value})} placeholder="Ej: S, M, L, XL" required />
            </div>
            <div className="form-group">
              <label className="form-label">Color *</label>
              <input className="form-input" value={variantData.color} onChange={e => setVariantData({...variantData, color:e.target.value})} placeholder="Ej: Rojo, Azul" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Código de Barras</label>
              <input className="form-input" value={variantData.barcode} onChange={e => setVariantData({...variantData, barcode:e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Mínimo</label>
              <input type="number" className="form-input" value={variantData.min_stock} onChange={e => setVariantData({...variantData, min_stock:parseInt(e.target.value)})} min="0" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowVariantForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Crear Variante</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
