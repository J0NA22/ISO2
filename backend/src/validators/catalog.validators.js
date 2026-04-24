// src/validators/catalog.validators.js
// Validadores para CRUD de categorías, tallas y colores

const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().min(2, 'Al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

const sizeSchema = z.object({
  name: z.string().min(1).max(20),
  sortOrder: z.number().int().min(0).optional().default(0),
});

const colorSchema = z.object({
  name: z.string().min(2).max(50),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'El código hex debe ser #RRGGBB').optional().default('#000000'),
});

module.exports = { categorySchema, sizeSchema, colorSchema };
