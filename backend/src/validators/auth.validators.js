// src/validators/auth.validators.js
// Schemas de validación para autenticación

const { z } = require('zod');

const loginSchema = z.object({
  username: z
    .string({ required_error: 'El nombre de usuario es requerido' })
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Solo letras, números y ._-'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(8, 'Mínimo 8 caracteres')
    .max(128, 'Máximo 128 caracteres'),
});

module.exports = { loginSchema };
