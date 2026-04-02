// Utilidad para generar comprobantes de venta (RF4)
// Genera un objeto de comprobante con todos los datos necesarios

/**
 * Genera un comprobante de venta formateado
 * @param {Object} sale - Datos de la venta
 * @param {Array} details - Detalles de productos vendidos
 * @param {Object} customer - Datos del cliente (opcional)
 * @param {Object} user - Datos del vendedor
 * @returns {Object} Comprobante formateado
 */
function generateReceipt(sale, details, customer, user) {
  const currencySymbol = sale.currency === 'USD' ? '$' : 'C$';

  const receipt = {
    // Encabezado de la tienda
    store: {
      name: "Zuleyka's Closet",
      slogan: 'Moda con estilo',
      address: 'Nicaragua',
    },
    // Información de la venta
    sale: {
      number: sale.sale_number,
      date: new Date(sale.created_at).toLocaleString('es-NI'),
      seller: `${user.first_name} ${user.last_name}`,
      paymentMethod: translatePaymentMethod(sale.payment_method),
      currency: sale.currency,
      currencySymbol,
    },
    // Información del cliente
    customer: customer
      ? {
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone || 'N/A',
        }
      : { name: 'Consumidor Final', phone: 'N/A' },
    // Detalle de productos
    items: details.map((d) => ({
      product: d.product_name,
      variant: `${d.size} / ${d.color}`,
      quantity: d.quantity,
      unitPrice: `${currencySymbol}${d.unit_price}`,
      discount: `${currencySymbol}${d.discount}`,
      subtotal: `${currencySymbol}${d.subtotal}`,
    })),
    // Totales
    totals: {
      subtotal: `${currencySymbol}${sale.subtotal}`,
      taxRate: `${sale.tax_rate}%`,
      taxAmount: `${currencySymbol}${sale.tax_amount}`,
      discount: `${currencySymbol}${sale.discount_amount}`,
      total: `${currencySymbol}${sale.total}`,
    },
    // Pie del comprobante
    footer: '¡Gracias por su compra! Visítenos de nuevo.',
  };

  // Si la venta es en USD, mostrar equivalente en NIO
  if (sale.currency === 'USD' && sale.exchange_rate) {
    receipt.totals.equivalentNIO = `C$${(parseFloat(sale.total) * parseFloat(sale.exchange_rate)).toFixed(2)}`;
    receipt.totals.exchangeRate = `1 USD = C$${sale.exchange_rate}`;
  }

  return receipt;
}

// Traduce el método de pago al español
function translatePaymentMethod(method) {
  const methods = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    mixto: 'Mixto',
  };
  return methods[method] || method;
}

module.exports = { generateReceipt };
