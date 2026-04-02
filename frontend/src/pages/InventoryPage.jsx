// Página de Inventario (RF10, RF11, RF12)
import { useState, useEffect } from 'react';
import { inventoryService, productService, providerService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { FiPlus, FiAlertTriangle, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const { hasRole } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [entryData, setEntryData] = useState({ variant_id:'', provider_id:'', entry_type:'entrada', quantity:'', reason:'' });
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => { loadInventory(); }, []);

  const loadInventory = async () => {
    try {
      const [invRes, lowRes, sumRes] = await Promise.all([
        inventoryService.getAll(),
        inventoryService.getLowStock(),
        inventoryService.getSummary(),
      ]);
      setInventory(invRes.data.data);
      setLowStock(lowRes.data.data);
      setSummary(sumRes.data.data);
    } catch { toast.error('Error al cargar inventario'); }
    finally { setLoading(false); }
  };

  const openEntryForm = async () => {
    try {
      const [prodRes, provRes] = await Promise.all([
        productService.getAll(),
        providerService.getAll(),
      ]);
      setProducts(prodRes.data.data);
      setProviders(provRes.data.data);
      setShowEntryForm(true);
    } catch { toast.error('Error al cargar datos'); }
  };

  const loadVariants = async (productId) => {
    try {
      const res = await productService.getVariants(productId);
      setVariants(res.data.data);
    } catch { setVariants([]); }
  };

  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addEntry(entryData);
      toast.success('Entrada registrada');
      setShowEntryForm(false);
      setEntryData({ variant_id:'', provider_id:'', entry_type:'entrada', quantity:'', reason:'' });
      loadInventory();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al registrar'); }
  };

  const displayData = tab === 'low' ? lowStock : inventory;

  if (loading) return <div className="main-content"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">📦 Inventario</h1>
        <div className="page-actions">
          {hasRole('admin','gerente') && (
            <button className="btn btn-primary" onClick={openEntryForm}><FiPlus /> Registrar Entrada</button>
          )}
        </div>
      </div>

      {/* Stats */}
      {summary && (
        <div className="grid-4 mb-3">
          <div className="stat-card"><div className="stat-icon info">📦</div><div className="stat-info"><h3>{summary.total_products}</h3><p>Productos</p></div></div>
          <div className="stat-card"><div className="stat-icon primary">🏷️</div><div className="stat-info"><h3>{summary.total_variants}</h3><p>Variantes</p></div></div>
          <div className="stat-card"><div className="stat-icon success">📊</div><div className="stat-info"><h3>{summary.total_stock}</h3><p>Unidades Totales</p></div></div>
          <div className="stat-card"><div className="stat-icon danger">⚠️</div><div className="stat-info"><h3>{summary.low_stock_count}</h3><p>Stock Bajo</p></div></div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <button className={`btn ${tab === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('all')}>Todo el Inventario</button>
        <button className={`btn ${tab === 'low' ? 'btn-warning' : 'btn-secondary'}`} onClick={() => setTab('low')}>
          <FiAlertTriangle /> Stock Bajo ({lowStock.length})
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Producto</th><th>Categoría</th><th>Talla</th><th>Color</th><th>Stock</th><th>Mín.</th><th>Precio Venta</th><th>Proveedor</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr><td colSpan="9" className="text-center text-muted" style={{padding:32}}>Sin resultados</td></tr>
              ) : displayData.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.product_name}</strong></td>
                  <td>{item.category || '-'}</td>
                  <td>{item.size}</td>
                  <td>{item.color}</td>
                  <td className={item.stock <= item.min_stock ? 'text-danger font-bold' : 'font-bold'}>{item.stock}</td>
                  <td>{item.min_stock}</td>
                  <td>C${parseFloat(item.sale_price).toFixed(2)}</td>
                  <td>{item.provider_name || '-'}</td>
                  <td>
                    <span className={`badge ${item.stock > item.min_stock ? 'badge-success' : item.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                      {item.stock > item.min_stock ? 'Normal' : item.stock > 0 ? 'Bajo' : 'Agotado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal entrada de inventario */}
      <Modal isOpen={showEntryForm} onClose={() => setShowEntryForm(false)} title="Registrar Movimiento de Inventario">
        <form onSubmit={handleEntrySubmit}>
          <div className="form-group">
            <label className="form-label">Tipo de Movimiento *</label>
            <select className="form-select" value={entryData.entry_type} onChange={e => setEntryData({...entryData, entry_type:e.target.value})} required>
              <option value="entrada">Entrada (compra/reabastecimiento)</option>
              <option value="salida">Salida (merma/devolución)</option>
              <option value="ajuste">Ajuste de inventario</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Producto *</label>
            <select className="form-select" onChange={e => { loadVariants(e.target.value); }} required>
              <option value="">Seleccionar producto</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Variante *</label>
            <select className="form-select" value={entryData.variant_id} onChange={e => setEntryData({...entryData, variant_id:e.target.value})} required>
              <option value="">Seleccionar variante</option>
              {variants.map(v => <option key={v.id} value={v.id}>{v.size} / {v.color} (Stock: {v.stock})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad *</label>
              <input type="number" className="form-input" value={entryData.quantity} onChange={e => setEntryData({...entryData, quantity:e.target.value})} min="1" required />
            </div>
            <div className="form-group">
              <label className="form-label">Proveedor</label>
              <select className="form-select" value={entryData.provider_id} onChange={e => setEntryData({...entryData, provider_id:e.target.value})}>
                <option value="">Sin proveedor</option>
                {providers.map(p => <option key={p.id} value={p.id}>{p.company_name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Razón / Notas</label>
            <input className="form-input" value={entryData.reason} onChange={e => setEntryData({...entryData, reason:e.target.value})} placeholder="Ej: Compra a proveedor, Ajuste por conteo..." />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEntryForm(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Registrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
