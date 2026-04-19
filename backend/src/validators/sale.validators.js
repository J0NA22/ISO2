// src/validators/sale.validators.js
// Schemas de validación para ventas — endpoint más crítico del sistema

const { z } = require('zod');

// Cada ítem del carrito
const saleItemSchema = z.object({
  variantId: z.number().int().positive('ID de variante inválido'),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio no puede ser negativo'),
  lineDiscount: z.number().min(0).optional().default(0),
});

// Cuerpo principal de crear venta
const createSaleSchema = z.object({
  customerId: z.number().int().positive().optional(),
  discountId: z.number().int().positive().optional(),
  items: z.array(saleItemSchema).min(1, 'Debe incluir al menos un producto'),
});

// Completar venta con pago
const completeSaleSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'TRANSFER', 'MIXED']),
  amountPaid: z.number().positive('El monto pagado debe ser mayor a 0'),
  changeGiven: z.number().min(0).optional().default(0),
  reference: z.string().max(100).optional(),
});

// Cancelar venta
const cancelSaleSchema = z.object({
  cancellationReason: z.string().min(5, 'Ingresa el motivo de cancelación').max(500),
});

module.exports = { createSaleSchema, completeSaleSchema, cancelSaleSchema };
