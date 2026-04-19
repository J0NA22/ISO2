// src/validators/user.validators.js
// Schemas de validación para usuarios

const { z } = require('zod');

const createUserSchema = z.object({
  fullName: z.string().min(2).max(200),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números y ._-'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe incluir mayúsculas, minúsculas y números'),
  roleId: z.number().int().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

const updateUserSchema = createUserSchema.omit({ password: true }).partial();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe incluir mayúsculas, minúsculas y números'),
});

module.exports = { createUserSchema, updateUserSchema, changePasswordSchema };
