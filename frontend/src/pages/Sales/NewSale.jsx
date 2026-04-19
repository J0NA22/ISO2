// src/pages/Sales/NewSale.jsx
// Punto de venta POS — flujo completo create → complete

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { productsAPI, salesAPI, customersAPI } from '../../api/endpoints';
import useCartStore from '../../store/cartStore';

const formatCurrency = (n) => `C$ ${Number(n || 0).toFixed(2)}`;

export default function NewSale() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [totals, setTotals] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [payment, setPayment] = useState({ method: 'CASH', amountPaid: '', reference: '' });
  const [submitting, setSubmitting] = useState(false);
  const searchRef = useRef();

  const { items, addItem, removeItem, updateQuantity, clearCart, customerId, setCustomer, toSalePayload } = useCartStore();

  // Cargar productos
  useEffect(() => {
    if (search.length < 2) return;
    const t = setTimeout(async () => {
      try {
        const res = await productsAPI.list({ search, status: 'ACTIVE', limit: 10 });
        setProducts(res.data);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Cargar clientes para búsqueda rápida
  useEffect(() => {
    customersAPI.list({ limit: 50 })
      .then((r) => setCustomers(r.data))
      .catch(() => {});
  }, []);

  // Recalcular totales cuando cambia el carrito
  useEffect(() => {
    if (items.length === 0) { setTotals(null); return; }
    const payload = toSalePayload();
    salesAPI.calculateTotals(payload)
      .then((r) => setTotals(r.data))
      .catch(() => {});
  }, [items]);

  // Scan por código de barras
  const handleBarcodeSearch = async (code) => {
    try {
      const res = await productsAPI.searchByBarcode(code);
      const product = res.data;
      if (product.variants?.length === 1) {
        addItem(product.variants[0], product);
        toast.success(`${product.name} agregado`);
      }
    } catch {
      toast.error('Producto no encontrado');
    }
  };

  const handleCompleteSale = async () => {
    if (!payment.amountPaid || Number(payment.amountPaid) <= 0) {
      toast.error('Ingresa el monto recibido');
      return;
    }
    if (payment.method === 'CASH' && Number(payment.amountPaid) < (totals?.total || 0)) {
      toast.error('El monto recibido es menor al total');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Crear venta
      const saleRes = await salesAPI.create(toSalePayload());
      const saleId = saleRes.data.id;

      // 2. Completar con pago
      const changeGiven = payment.method === 'CASH'
        ? Math.max(0, Number(payment.amountPaid) - (totals?.total || 0))
        : 0;

      await salesAPI.complete(saleId, {
        method: payment.method,
        amountPaid: Number(payment.amountPaid),
        changeGiven,
        reference: payment.reference || undefined,
      });

      toast.success('✅ Venta completada exitosamente');
      clearCart();
      navigate('/sales');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ padding: '16px' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Nueva Venta</h1>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/sales')}>← Volver</button>
      </div>

      <div className="pos-layout">
        {/* Panel izquierdo: búsqueda de productos */}
        <div className="pos-products">
          {/* Búsqueda */}
          <div className="card mb-4">
            <div className="search-bar" style={{ maxWidth: '100%' }}>
              <span className="search-icon">🔍</span>
              <input
                ref={searchRef}
                id="product-search"
                type="text"
                placeholder="Buscar producto o escanear código de barras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Resultados de búsqueda */}
            {search.length >= 2 && products.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>{p.name} — {p.category?.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {p.variants?.filter((v) => v.isActive).map((v) => (
                        <button
                          key={v.id}
                          id={`add-variant-${v.id}`}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 12 }}
                          onClick={() => { addItem(v, p); setSearch(''); toast.success(`${p.name} (${v.size?.name}/${v.color?.name}) agregado`); }}
                        >
                          <span className="color-dot" style={{ background: v.color?.hexCode }} />
                          {v.size?.name}/{v.color?.name} — {formatCurrency(v.specificPrice || p.basePrice)}
                          {v.stock && <span style={{ marginLeft: 4, color: v.stock.quantity <= 5 ? 'var(--accent-warning)' : 'var(--text-muted)' }}>
                            ({v.stock.quantity})
                          </span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selector de cliente */}
          <div className="card">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Cliente (opcional)</label>
              <select
                id="customer-select"
                className="form-select"
                value={customerId || ''}
                onChange={(e) => setCustomer(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Consumidor final</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Panel derecho: carrito */}
        <div className="pos-cart">
          <div className="cart-header">
            🛒 Carrito ({items.length} ítems)
          </div>

          <div className="cart-items">
            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 20px' }}>
                <div className="empty-icon">🛍️</div>
                <p>Agrega productos buscándolos arriba</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="cart-item">
                  <div className="flex justify-between items-center mb-4" style={{ marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.productName}</div>
                      <div className="text-muted text-sm">
                        <span className="color-dot" style={{ background: item.hexCode, marginRight: 4 }} />
                        {item.size} / {item.color}
                      </div>
                    </div>
                    <button
                      className="btn btn-icon btn-ghost btn-sm"
                      onClick={() => removeItem(item.variantId)}
                    >❌</button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >−</button>
                      <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >+</button>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatCurrency(item.lineSubtotal)}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totales */}
          {totals && (
            <div className="cart-totals">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="totals-row" style={{ color: 'var(--accent-success)' }}>
                  <span>Descuento</span>
                  <span>−{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="totals-row">
                <span>IVA ({(totals.taxRate * 100).toFixed(0)}%)</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="totals-row total">
                <span>TOTAL</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>

              {!showPayment ? (
                <button
                  id="proceed-payment-btn"
                  className="btn btn-success w-full btn-lg"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowPayment(true)}
                  disabled={items.length === 0}
                >
                  💳 Proceder al Pago
                </button>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Método de pago</label>
                    <select
                      id="payment-method"
                      className="form-select"
                      value={payment.method}
                      onChange={(e) => setPayment({ ...payment, method: e.target.value })}
                    >
                      <option value="CASH">💵 Efectivo</option>
                      <option value="CARD">💳 Tarjeta</option>
                      <option value="TRANSFER">📱 Transferencia</option>
                      <option value="MIXED">🔀 Mixto</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monto recibido</label>
                    <input
                      id="amount-paid"
                      className="form-input"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={formatCurrency(totals.total)}
                      value={payment.amountPaid}
                      onChange={(e) => setPayment({ ...payment, amountPaid: e.target.value })}
                    />
                  </div>
                  {payment.method !== 'CASH' && (
                    <div className="form-group">
                      <label className="form-label">Referencia</label>
                      <input
                        id="payment-reference"
                        className="form-input"
                        type="text"
                        placeholder="# comprobante o referencia"
                        value={payment.reference}
                        onChange={(e) => setPayment({ ...payment, reference: e.target.value })}
                        maxLength={100}
                      />
                    </div>
                  )}
                  {payment.method === 'CASH' && payment.amountPaid && (
                    <div style={{ background: 'rgba(45,214,123,0.1)', border: '1px solid rgba(45,214,123,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>
                        Cambio: {formatCurrency(Math.max(0, Number(payment.amountPaid) - totals.total))}
                      </span>
                    </div>
                  )}
                  <button
                    id="confirm-sale-btn"
                    className="btn btn-success w-full"
                    onClick={handleCompleteSale}
                    disabled={submitting}
                  >
                    {submitting ? '⏳ Procesando...' : '✅ Confirmar Venta'}
                  </button>
                  <button
                    className="btn btn-ghost w-full btn-sm"
                    style={{ marginTop: 8 }}
                    onClick={() => setShowPayment(false)}
                  >Cancelar pago</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
