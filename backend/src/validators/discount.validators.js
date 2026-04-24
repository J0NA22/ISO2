// src/validators/discount.validators.js

const { z } = require('zod');

const createDiscountSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  type: z.enum(['PERCENTAGE', 'FIXED'], { message: 'Tipo debe ser PERCENTAGE o FIXED' }),
  value: z.number().positive('El valor debe ser mayor a 0'),
  isActive: z.boolean().optional().default(true),
});

const updateDiscountSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
  value: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createDiscountSchema, updateDiscountSchema };
