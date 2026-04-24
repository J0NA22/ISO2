// src/validators/taxConfig.validators.js

const { z } = require('zod');

const createTaxSchema = z.object({
  name: z.string().min(2).max(50),
  rate: z.number().min(0, 'La tasa no puede ser negativa').max(1, 'La tasa máxima es 1.0 (100%)'),
  isActive: z.boolean().optional().default(true),
});

const updateTaxSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  rate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

module.exports = { createTaxSchema, updateTaxSchema };
