// Página de Reportes (RF18, RF19, RF20, RF26, RF31)
import { useState, useEffect } from 'react';
import { reportService, exportService, saleService } from '../services/dataService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDownload, FiCalendar, FiX } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [tab, setTab] = useState('sales');
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [saleDetail, setSaleDetail] = useState(null);
  // Historial de ventas
  const [sales, setSales] = useState([]);

  useEffect(() => { loadReports(); }, [startDate, endDate, tab]);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (tab === 'sales') {
        const [repRes, salesRes] = await Promise.all([
          reportService.sales({ startDate, endDate }),
          saleService.getAll({ startDate, endDate }),
        ]);
        setSalesData(repRes.data.data);
        setSales(salesRes.data.data);
      } else if (tab === 'top') {
        const res = await reportService.topProducts({ startDate, endDate });
        setTopProducts(res.data.data);
      } else if (tab === 'inventory') {
        const res = await reportService.inventory();
        setInventoryData(res.data.data);
      }
    } catch { toast.error('Error al cargar reportes'); }
    finally { setLoading(false); }
  };

  const handleExport = async (type) => {
    try {
      let res;
      if (type === 'sales') res = await exportService.sales({ startDate, endDate });
      else if (type === 'inventory') res = await exportService.inventory();
      else res = await exportService.topProducts({ startDate, endDate });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${type}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Archivo descargado');
    } catch { toast.error('Error al exportar'); }
  };

  const handleCancelSale = async (id) => {
    if (!confirm('¿Cancelar esta venta? Se restaurará el stock.')) return;
    try {
      await saleService.cancel(id);
      toast.success('Venta cancelada');
      loadReports();
    } catch (err) { toast.error(err.response?.data?.message || 'Error al cancelar'); }
  };

  const viewSaleDetail = async (id) => {
    try {
      const res = await saleService.getById(id);
      setSaleDetail(res.data.data);
      setShowSaleDetail(true);
    } catch { toast.error('Error al cargar detalle'); }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">📊 Reportes</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-2">
        <button className={`btn ${tab==='sales'?'btn-primary':'btn-secondary'}`} onClick={()=>setTab('sales')}>Ventas</button>
        <button className={`btn ${tab==='top'?'btn-primary':'btn-secondary'}`} onClick={()=>setTab('top')}>Más Vendidos</button>
        <button className={`btn ${tab==='inventory'?'btn-primary':'btn-secondary'}`} onClick={()=>setTab('inventory')}>Inventario</button>
      </div>

      {/* Filtros de fecha */}
      {tab !== 'inventory' && (
        <div className="filter-bar">
          <FiCalendar />
          <input type="date" className="form-input" value={startDate} onChange={e=>setStartDate(e.target.value)} style={{width:180}} />
          <span className="text-muted">a</span>
          <input type="date" className="form-input" value={endDate} onChange={e=>setEndDate(e.target.value)} style={{width:180}} />
          <button className="btn btn-success btn-sm" onClick={() => handleExport(tab === 'top' ? 'top-products' : tab)}>
            <FiDownload /> Exportar Excel
          </button>
        </div>
      )}

      {tab === 'inventory' && (
        <div className="filter-bar">
          <button className="btn btn-success btn-sm" onClick={() => handleExport('inventory')}>
            <FiDownload /> Exportar Inventario a Excel
          </button>
        </div>
      )}

      {loading ? <div className="loading-container"><div className="spinner"></div></div> : (
        <>
          {/* Reporte de ventas */}
          {tab === 'sales' && (
            <>
              {salesData.length > 0 && (
                <div className="card mb-3">
                  <h3 className="card-title mb-2">Ventas por Día</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DE" />
                      <XAxis dataKey="fecha" tick={{fontSize:12}} />
                      <YAxis tick={{fontSize:12}} />
                      <Tooltip />
                      <Bar dataKey="monto_total" fill="#B8945F" radius={[6,6,0,0]} name="Monto" />
                      <Bar dataKey="total_ventas" fill="#4CAF50" radius={[6,6,0,0]} name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Historial de Ventas</h3>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead><tr><th>Nº</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {sales.map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.sale_number}</strong></td>
                          <td>{new Date(s.created_at).toLocaleString('es-NI')}</td>
                          <td>{s.customer_name ? `${s.customer_name} ${s.customer_last_name}` : 'Consumidor Final'}</td>
                          <td className="font-bold">{s.currency==='USD'?'$':'C$'}{parseFloat(s.total).toFixed(2)}</td>
                          <td>{s.payment_method}</td>
                          <td><span className={`badge ${s.status==='completada'?'badge-success':'badge-danger'}`}>{s.status}</span></td>
                          <td>
                            <div className="flex gap-1">
                              <button className="btn btn-ghost btn-sm" onClick={()=>viewSaleDetail(s.id)}>Ver</button>
                              {s.status === 'completada' && <button className="btn btn-ghost btn-sm text-danger" onClick={()=>handleCancelSale(s.id)}>Cancelar</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Top Products */}
          {tab === 'top' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>#</th><th>Producto</th><th>Categoría</th><th>Talla</th><th>Color</th><th>Cantidad Vendida</th><th>Ingresos</th></tr></thead>
                  <tbody>
                    {topProducts.map((p,i) => (
                      <tr key={i}>
                        <td><strong>#{i+1}</strong></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.category || '-'}</td>
                        <td>{p.size}</td>
                        <td>{p.color}</td>
                        <td className="font-bold">{p.total_vendido}</td>
                        <td className="font-bold text-success">C${parseFloat(p.total_ingresos).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inventory Report */}
          {tab === 'inventory' && (
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Talla</th><th>Color</th><th>Stock</th><th>Mín.</th><th>Valor Costo</th><th>Valor Venta</th><th>Proveedor</th></tr></thead>
                  <tbody>
                    {inventoryData.map((item,i) => (
                      <tr key={i}>
                        <td><strong>{item.name}</strong></td>
                        <td>{item.category || '-'}</td>
                        <td>{item.size}</td>
                        <td>{item.color}</td>
                        <td className={item.stock <= item.min_stock ? 'text-danger font-bold' : ''}>{item.stock}</td>
                        <td>{item.min_stock}</td>
                        <td>C${parseFloat(item.valor_costo).toFixed(2)}</td>
                        <td className="font-bold">C${parseFloat(item.valor_venta).toFixed(2)}</td>
                        <td>{item.proveedor || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sale Detail Modal */}
      <Modal isOpen={showSaleDetail} onClose={() => setShowSaleDetail(false)} title={`Venta ${saleDetail?.sale_number || ''}`} size="lg">
        {saleDetail && (
          <div>
            <div className="grid-3 mb-2" style={{fontSize:'0.9rem'}}>
              <div><strong>Vendedor:</strong> {saleDetail.seller_first_name} {saleDetail.seller_last_name}</div>
              <div><strong>Cliente:</strong> {saleDetail.customer_first_name ? `${saleDetail.customer_first_name} ${saleDetail.customer_last_name}` : 'Consumidor Final'}</div>
              <div><strong>Fecha:</strong> {new Date(saleDetail.created_at).toLocaleString('es-NI')}</div>
            </div>
            <table className="table">
              <thead><tr><th>Producto</th><th>Talla</th><th>Color</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead>
              <tbody>
                {saleDetail.details?.map((d,i) => (
                  <tr key={i}>
                    <td>{d.product_name}</td><td>{d.size}</td><td>{d.color}</td>
                    <td>{d.quantity}</td><td>C${parseFloat(d.unit_price).toFixed(2)}</td><td className="font-bold">C${parseFloat(d.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{textAlign:'right', marginTop:16, fontSize:'1.1rem'}}>
              <div>Subtotal: C${parseFloat(saleDetail.subtotal).toFixed(2)}</div>
              <div>IVA ({saleDetail.tax_rate}%): C${parseFloat(saleDetail.tax_amount).toFixed(2)}</div>
              <div className="font-bold" style={{fontSize:'1.3rem'}}>Total: {saleDetail.currency==='USD'?'$':'C$'}{parseFloat(saleDetail.total).toFixed(2)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
