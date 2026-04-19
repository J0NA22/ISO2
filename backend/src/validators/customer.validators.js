// src/validators/customer.validators.js

const { z } = require('zod');

const createCustomerSchema = z.object({
  fullName: z.string().min(2).max(200),
  phone: z.string().max(20).optional(),
  email: z.string().email('Email inválido').max(150).optional(),
  address: z.string().max(500).optional(),
});

const updateCustomerSchema = createCustomerSchema.partial();

module.exports = { createCustomerSchema, updateCustomerSchema };
