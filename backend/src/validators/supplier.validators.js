// src/validators/supplier.validators.js

const { z } = require('zod');

const createSupplierSchema = z.object({
  name: z.string().min(2).max(200),
  contactPerson: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(150).optional(),
  address: z.string().max(500).optional(),
});

const updateSupplierSchema = createSupplierSchema.partial();

module.exports = { createSupplierSchema, updateSupplierSchema };
