// src/validators/product.validators.js
// Schemas de validación para productos y variantes

const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  categoryId: z.number().int().positive(),
  barcode: z.string().max(50).optional(),
  basePrice: z.number().positive('El precio debe ser mayor a 0'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const updateProductSchema = createProductSchema.partial();

const createVariantSchema = z.object({
  sizeId: z.number().int().positive(),
  colorId: z.number().int().positive(),
  sku: z.string().min(2).max(50),
  specificPrice: z.number().positive().optional(),
  minThreshold: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createProductSchema, updateProductSchema, createVariantSchema };
