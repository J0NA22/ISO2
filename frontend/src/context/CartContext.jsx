// Contexto del carrito de venta para el POS
import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [currency, setCurrency] = useState('NIO');
  const [taxRate, setTaxRate] = useState(15);

  // Agregar item al carrito
  const addItem = (product, variant) => {
    setItems(prev => {
      const existing = prev.find(i => i.variant_id === variant.id);
      if (existing) {
        // Si ya existe, incrementar cantidad
        if (existing.quantity >= variant.stock) return prev;
        return prev.map(i =>
          i.variant_id === variant.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
            : i
        );
      }
      // Agregar nuevo item
      return [...prev, {
        variant_id: variant.id,
        product_name: product.name,
        size: variant.size,
        color: variant.color,
        unit_price: parseFloat(product.sale_price),
        quantity: 1,
        stock: variant.stock,
        discount: 0,
        subtotal: parseFloat(product.sale_price),
      }];
    });
  };

  // Actualizar cantidad de un item
  const updateQuantity = (variantId, quantity) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.variant_id === variantId
          ? { ...i, quantity, subtotal: quantity * i.unit_price - i.discount }
          : i
      )
    );
  };

  // Remover item del carrito
  const removeItem = (variantId) => {
    setItems(prev => prev.filter(i => i.variant_id !== variantId));
  };

  // Aplicar descuento a un item
  const applyItemDiscount = (variantId, discountAmount) => {
    setItems(prev =>
      prev.map(i =>
        i.variant_id === variantId
          ? { ...i, discount: discountAmount, subtotal: i.quantity * i.unit_price - discountAmount }
          : i
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    setCustomer(null);
    setDiscount(0);
  };

  // Calcular totales
  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const taxAmount = parseFloat((((subtotal - discount) * taxRate) / 100).toFixed(2));
  const total = parseFloat((subtotal - discount + taxAmount).toFixed(2));
  const currencySymbol = currency === 'USD' ? '$' : 'C$';

  return (
    <CartContext.Provider value={{
      items, customer, discount, currency, taxRate, currencySymbol,
      subtotal, taxAmount, total,
      addItem, updateQuantity, removeItem, applyItemDiscount,
      clearCart, setCustomer, setDiscount, setCurrency, setTaxRate,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
};
