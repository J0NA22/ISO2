// Servicio de ventas (RF1, RF2, RF3, RF5, RF28) - Lógica de negocio
const saleRepository = require('../repositories/saleRepository');
const variantRepository = require('../repositories/variantRepository');
const { query } = require('../config/database');
const AppError = require('../utils/AppError');
const { generateReceipt } = require('../utils/receipt');

class SaleService {
  // Registrar una venta completa (RF1)
  async createSale(saleData, items, userId) {
    // Validar que hay items
    if (!items || items.length === 0) {
      throw AppError.badRequest('La venta debe tener al menos un producto');
    }

    // Obtener configuración de precios
    const configResult = await query(
      `SELECT * FROM price_configs WHERE currency = $1`,
      [saleData.currency || 'NIO']
    );
    const config = configResult.rows[0];
    const taxRate = saleData.tax_rate || (config ? parseFloat(config.tax_rate) : 15);
    const exchangeRate = config ? parseFloat(config.exchange_rate) : 1;

    // Construir detalles y calcular totales
    const details = [];
    let subtotal = 0;

    for (const item of items) {
      // Verificar existencia y stock de la variante
      const variant = await variantRepository.findById(item.variant_id);
      if (!variant) {
        throw AppError.notFound(`Variante de producto #${item.variant_id} no encontrada`);
      }
      if (variant.stock < item.quantity) {
        throw AppError.badRequest(
          `Stock insuficiente para "${variant.product_name}" (${variant.size}/${variant.color}). ` +
          `Disponible: ${variant.stock}, Solicitado: ${item.quantity}`
        );
      }

      const unitPrice = item.unit_price || parseFloat(variant.sale_price);
      const discount = parseFloat(item.discount || 0);
      const itemSubtotal = (unitPrice * item.quantity) - discount;

      details.push({
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        discount: discount,
        subtotal: itemSubtotal,
      });

      subtotal += itemSubtotal;
    }

    // Calcular impuestos y total (RF2)
    const discountAmount = parseFloat(saleData.discount_amount || 0);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = parseFloat(((taxableAmount * taxRate) / 100).toFixed(2));
    const total = parseFloat((taxableAmount + taxAmount).toFixed(2));

    // Datos de la venta
    const sale = {
      customer_id: saleData.customer_id || null,
      user_id: userId,
      cash_register_id: saleData.cash_register_id || null,
      subtotal: subtotal.toFixed(2),
      tax_rate: taxRate,
      tax_amount: taxAmount,
      discount_amount: discountAmount.toFixed(2),
      total: total.toFixed(2),
      currency: saleData.currency || 'NIO',
      exchange_rate: exchangeRate,
      payment_method: saleData.payment_method || 'efectivo', // RF3
      notes: saleData.notes || null,
    };

    // Crear la venta (el repositorio maneja la transacción y actualiza stock)
    const createdSale = await saleRepository.create(sale, details);
    return createdSale;
  }

  // Obtener venta por ID
  async getById(saleId) {
    const sale = await saleRepository.findById(saleId);
    if (!sale) {
      throw AppError.notFound('Venta no encontrada');
    }
    return sale;
  }

  // Listar ventas con filtros (RF25, RF26)
  async getAll(filters) {
    return await saleRepository.findAll(filters);
  }

  // Cancelar venta (RF5) - restaura stock automáticamente
  async cancel(saleId) {
    const sale = await saleRepository.findById(saleId);
    if (!sale) {
      throw AppError.notFound('Venta no encontrada');
    }
    if (sale.status === 'cancelada') {
      throw AppError.badRequest('La venta ya fue cancelada');
    }

    return await saleRepository.cancel(saleId);
  }

  // Generar comprobante (RF4)
  async getReceipt(saleId) {
    const sale = await saleRepository.findById(saleId);
    if (!sale) {
      throw AppError.notFound('Venta no encontrada');
    }

    const customer = sale.customer_first_name
      ? { first_name: sale.customer_first_name, last_name: sale.customer_last_name, phone: sale.customer_phone }
      : null;

    const user = {
      first_name: sale.seller_first_name,
      last_name: sale.seller_last_name,
    };

    return generateReceipt(sale, sale.details, customer, user);
  }
}

module.exports = new SaleService();
