// Página POS - Terminal de Punto de Venta (RF1-RF5)
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { productService, saleService, customerService, configService } from '../services/dataService';
import Modal from '../components/common/Modal';
import { FiSearch, FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiUser, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function POSPage() {
  const {
    items, subtotal, taxAmount, total, currencySymbol, currency, taxRate,
    addItem, updateQuantity, removeItem, clearCart, setCustomer, customer,
    setDiscount, discount, setCurrency, setTaxRate, itemCount,
  } = useCart();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [customers, setCustomers] = useState([]);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [processing, setProcessing] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    loadProducts();
    loadConfig();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productService.getAll({ search });
      setProducts(res.data.data);
    } catch (err) { toast.error('Error al cargar productos'); }
  };

  const loadConfig = async () => {
    try {
      const res = await configService.getPriceConfigs();
      const defaultConfig = res.data.data.find(c => c.is_default);
      if (defaultConfig) {
        setCurrency(defaultConfig.currency);
        setTaxRate(parseFloat(defaultConfig.tax_rate));
      }
    } catch (err) { /* usar valores por defecto */ }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadProducts(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleProductClick = async (product) => {
    try {
      const res = await productService.getVariants(product.id);
      const v = res.data.data;
      if (v.length === 1) {
        if (v[0].stock <= 0) { toast.error('Sin stock disponible'); return; }
        addItem(product, v[0]);
        toast.success('Producto agregado');
      } else {
        setSelectedProduct(product);
        setVariants(v);
        setShowVariants(true);
      }
    } catch (err) { toast.error('Error al cargar variantes'); }
  };

  const handleVariantSelect = (variant) => {
    if (variant.stock <= 0) { toast.error('Sin stock'); return; }
    addItem(selectedProduct, variant);
    setShowVariants(false);
    toast.success('Producto agregado');
  };

  const handleBarcodeScan = async (e) => {
    if (e.key === 'Enter' && search.trim()) {
      try {
        const res = await productService.getByBarcode(search.trim());
        const p = res.data.data;
        if (p) {
          addItem({ id: p.id, name: p.name, sale_price: p.sale_price },
                  { id: p.variant_id, size: p.size, color: p.color, stock: p.stock });
          setSearch('');
          toast.success('Producto escaneado');
        }
      } catch { /* No se encontró con código de barras, buscar normalmente */ }
    }
  };

  const handlePay = async () => {
    if (items.length === 0) { toast.error('Agregue productos primero'); return; }
    setProcessing(true);
    try {
      const saleData = {
        customer_id: customer?.id || null,
        currency,
        tax_rate: taxRate,
        discount_amount: discount,
        payment_method: paymentMethod,
        items: items.map(i => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
          subtotal: i.subtotal,
        })),
      };

      const res = await saleService.create(saleData);
      const saleId = res.data.data.id;

      // Obtener comprobante
      const receiptRes = await saleService.getReceipt(saleId);
      setReceipt(receiptRes.data.data);
      setShowPayment(false);
      setShowReceipt(true);
      clearCart();
      toast.success('¡Venta registrada exitosamente!');
      loadProducts(); // Refrescar stock
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al procesar la venta');
    } finally {
      setProcessing(false);
    }
  };

  const searchCustomers = async (q) => {
    setCustomerSearch(q);
    if (q.length >= 2) {
      try {
        const res = await customerService.getAll({ search: q });
        setCustomers(res.data.data);
      } catch { /* ignorar */ }
    }
  };

  return (
    <div className="main-content" style={{ padding: 'var(--space-md)' }}>
      <div className="pos-container">
        {/* Panel de productos */}
        <div className="pos-products">
          <div className="pos-search">
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar producto o escanear código de barras..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcodeScan}
                style={{ paddingLeft: 40 }}
              />
            </div>
          </div>

          <div className="pos-product-grid">
            {products.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-state-icon">📦</div>
                <h3>No hay productos</h3>
                <p>Registre productos para comenzar a vender</p>
              </div>
            ) : products.map((product) => (
              <div
                key={product.id}
                className="pos-product-card"
                onClick={() => handleProductClick(product)}
              >
                <div className="pos-product-name">{product.name}</div>
                <div className="pos-product-category">{product.category || 'Sin categoría'}</div>
                <div className="pos-product-price">
                  {currencySymbol}{parseFloat(product.sale_price).toFixed(2)}
                </div>
                <div className={`pos-product-stock ${product.total_stock <= 5 ? 'low' : ''}`}>
                  Stock: {product.total_stock} | {product.variant_count} variante{product.variant_count !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrito */}
        <div className="pos-cart">
          <div className="pos-cart-header">
            <h3><FiShoppingBag style={{ marginRight: 8 }} />Venta Actual</h3>
            <span className="pos-cart-count">{itemCount}</span>
          </div>

          {/* Cliente seleccionado */}
          <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            {customer ? (
              <div className="flex-between">
                <span><FiUser style={{ marginRight: 4 }} />{customer.first_name} {customer.last_name}</span>
                <button className="btn-icon btn-ghost" onClick={() => setCustomer(null)} style={{width:24,height:24}}><FiX size={14} /></button>
              </div>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCustomerSearch(true)} style={{width:'100%'}}>
                <FiUser /> Seleccionar Cliente
              </button>
            )}
          </div>

          {/* Items del carrito */}
          <div className="pos-cart-items">
            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 16px' }}>
                <div className="empty-state-icon">🛒</div>
                <p>Carrito vacío</p>
              </div>
            ) : items.map((item) => (
              <div key={item.variant_id} className="pos-cart-item">
                <div className="pos-cart-item-info">
                  <div className="pos-cart-item-name">{item.product_name}</div>
                  <div className="pos-cart-item-variant">{item.size} / {item.color}</div>
                </div>
                <div className="pos-cart-item-qty">
                  <button onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}><FiMinus size={12} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.variant_id, Math.min(item.quantity + 1, item.stock))}><FiPlus size={12} /></button>
                </div>
                <div className="pos-cart-item-price">{currencySymbol}{item.subtotal.toFixed(2)}</div>
                <button className="pos-cart-item-remove" onClick={() => removeItem(item.variant_id)}><FiTrash2 size={14} /></button>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="pos-cart-totals">
            <div className="pos-cart-total-row">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="pos-cart-total-row text-danger">
                <span>Descuento</span>
                <span>-{currencySymbol}{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pos-cart-total-row">
              <span>IVA ({taxRate}%)</span>
              <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>
            <div className="pos-cart-total-row total">
              <span>TOTAL</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Acciones */}
          <div className="pos-cart-actions">
            <button className="pos-pay-btn" onClick={() => setShowPayment(true)} disabled={items.length === 0}>
              💳 Cobrar {currencySymbol}{total.toFixed(2)}
            </button>
            <button className="pos-clear-btn" onClick={clearCart} disabled={items.length === 0}>
              Limpiar Carrito
            </button>
          </div>
        </div>
      </div>

      {/* Modal de variantes */}
      <Modal isOpen={showVariants} onClose={() => setShowVariants(false)} title={`Seleccionar Variante — ${selectedProduct?.name || ''}`}>
        <div className="pos-variants-modal">
          <div className="variant-grid">
            {variants.map((v) => (
              <div
                key={v.id}
                className={`variant-chip ${v.stock <= 0 ? 'out-of-stock' : ''}`}
                onClick={() => handleVariantSelect(v)}
              >
                <div className="variant-size">{v.size}</div>
                <div className="variant-color">{v.color}</div>
                <div className="variant-stock">{v.stock > 0 ? `${v.stock} disp.` : 'Agotado'}</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal de pago */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Procesar Pago">
        <div>
          <h4 style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Método de Pago</h4>
          <div className="payment-methods">
            {['efectivo', 'tarjeta', 'transferencia'].map((m) => (
              <button
                key={m}
                className={`payment-method-btn ${paymentMethod === m ? 'active' : ''}`}
                onClick={() => setPaymentMethod(m)}
              >
                <div className="payment-method-icon">{m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '📱'}</div>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Descuento General ({currencySymbol})</label>
            <input
              type="number"
              className="form-input"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Moneda</label>
            <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="NIO">Córdobas (C$)</option>
              <option value="USD">Dólares ($)</option>
            </select>
          </div>

          <div style={{ background: 'var(--bg-input)', padding: 16, borderRadius: 8, marginTop: 16 }}>
            <div className="pos-cart-total-row"><span>Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="pos-cart-total-row text-danger"><span>Descuento</span><span>-{currencySymbol}{discount.toFixed(2)}</span></div>}
            <div className="pos-cart-total-row"><span>IVA ({taxRate}%)</span><span>{currencySymbol}{taxAmount.toFixed(2)}</span></div>
            <div className="pos-cart-total-row total"><span>TOTAL</span><span>{currencySymbol}{total.toFixed(2)}</span></div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancelar</button>
            <button className="btn btn-primary btn-lg" onClick={handlePay} disabled={processing}>
              {processing ? 'Procesando...' : `Confirmar Pago ${currencySymbol}${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de comprobante */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="Comprobante de Venta">
        {receipt && (
          <div className="receipt">
            <div className="receipt-header">
              <h3>{receipt.store.name}</h3>
              <p>{receipt.store.slogan}</p>
              <p style={{ marginTop: 8 }}>Nº {receipt.sale.number}</p>
              <p>{receipt.sale.date}</p>
              <p>Vendedor: {receipt.sale.seller}</p>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Cliente:</strong> {receipt.customer.name}
            </div>
            <div className="receipt-items">
              {receipt.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>{item.quantity}x {item.product} ({item.variant})</span>
                  <span>{item.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="receipt-totals">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>{receipt.totals.subtotal}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>IVA ({receipt.totals.taxRate}):</span><span>{receipt.totals.taxAmount}</span></div>
              {receipt.totals.discount !== `${receipt.sale.currencySymbol}0` && receipt.totals.discount !== `${receipt.sale.currencySymbol}0.00` && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Descuento:</span><span>{receipt.totals.discount}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', marginTop: 8 }}>
                <span>TOTAL:</span><span>{receipt.totals.total}</span>
              </div>
              {receipt.totals.equivalentNIO && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Equivalente: {receipt.totals.equivalentNIO} ({receipt.totals.exchangeRate})
                </div>
              )}
            </div>
            <div className="receipt-footer">
              <p>Pago: {receipt.sale.paymentMethod}</p>
              <p style={{marginTop: 8}}>{receipt.footer}</p>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => { setShowReceipt(false); setReceipt(null); }}>Cerrar</button>
        </div>
      </Modal>

      {/* Modal buscar cliente */}
      <Modal isOpen={showCustomerSearch} onClose={() => setShowCustomerSearch(false)} title="Seleccionar Cliente">
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por nombre, teléfono..."
            value={customerSearch}
            onChange={(e) => searchCustomers(e.target.value)}
            autoFocus
          />
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {customers.map((c) => (
            <div
              key={c.id}
              style={{ padding: '10px 12px', cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}
              className="pos-cart-item"
              onClick={() => { setCustomer(c); setShowCustomerSearch(false); setCustomerSearch(''); }}
            >
              <FiUser style={{ marginRight: 8 }} />
              <span>{c.first_name} {c.last_name}</span>
              <span className="text-muted" style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>{c.phone}</span>
            </div>
          ))}
          {customerSearch.length >= 2 && customers.length === 0 && (
            <p className="text-center text-muted" style={{ padding: 16 }}>No se encontraron clientes</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
