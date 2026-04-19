// src/store/cartStore.js
// Estado del carrito de ventas POS con Zustand

import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  customerId: null,
  discountId: null,
  paymentMethod: null,

  addItem: (variant, product) => {
    const items = get().items;
    const existing = items.find((i) => i.variantId === variant.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.variantId === variant.id
            ? { ...i, quantity: i.quantity + 1, lineSubtotal: (i.quantity + 1) * i.unitPrice }
            : i
        ),
      });
    } else {
      const unitPrice = Number(variant.specificPrice || product.basePrice);
      const newItem = {
        variantId: variant.id,
        productName: product.name,
        sku: variant.sku,
        size: variant.size?.name,
        color: variant.color?.name,
        hexCode: variant.color?.hexCode,
        quantity: 1,
        unitPrice,
        lineDiscount: 0,
        lineSubtotal: unitPrice,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (variantId) => {
    set({ items: get().items.filter((i) => i.variantId !== variantId) });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity < 1) return;
    set({
      items: get().items.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity, lineSubtotal: quantity * i.unitPrice - i.lineDiscount }
          : i
      ),
    });
  },

  setCustomer: (customerId) => set({ customerId }),
  setDiscount: (discountId) => set({ discountId }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearCart: () => set({ items: [], customerId: null, discountId: null, paymentMethod: null }),

  // Cómputos derivados
  getSubtotal: () => get().items.reduce((sum, i) => sum + i.lineSubtotal, 0),

  toSalePayload: () => ({
    customerId: get().customerId || undefined,
    discountId: get().discountId || undefined,
    items: get().items.map((i) => ({
      variantId: i.variantId,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineDiscount: i.lineDiscount,
    })),
  }),
}));

export default useCartStore;
