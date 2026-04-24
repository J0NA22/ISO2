// src/validators/cashClosing.validators.js

const { z } = require('zod');

const cashClosingSchema = z.object({
  openingDate: z.string().datetime({ message: 'Fecha de apertura inválida (ISO 8601 requerido)' }),
  countedAmount: z.number().min(0, 'El monto contado no puede ser negativo'),
  initialAmount: z.number().min(0).optional().default(0),
  notes: z.string().max(500).optional(),
});

module.exports = { cashClosingSchema };
