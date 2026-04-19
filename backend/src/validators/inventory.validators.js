// src/validators/inventory.validators.js
// Schemas para entradas de inventario

const { z } = require('zod');

const entryDetailSchema = z.object({
  variantId: z.number().int().positive(),
  quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0, 'El costo no puede ser negativo'),
});

const createInventoryEntrySchema = z.object({
  supplierId: z.number().int().positive('Proveedor requerido'),
  notes: z.string().max(500).optional(),
  details: z.array(entryDetailSchema).min(1, 'Debe incluir al menos un producto'),
});

module.exports = { createInventoryEntrySchema };
