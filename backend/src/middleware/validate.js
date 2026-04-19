// src/middleware/validate.js
// Middleware de validación con Zod — Sanitización de entradas (SOLID-S)
// Centraliza la validación de request bodies en un solo lugar

const { ZodError } = require('zod');
const { sendError } = require('../utils/response');

/**
 * Factory que retorna un middleware que valida el body con un schema Zod.
 * Si la validación falla, retorna 422 con los errores formateados.
 * Los datos parseados (sanitizados) se asignan a req.body.
 *
 * @param {ZodSchema} schema - Schema Zod a validar
 * @param {'body'|'query'|'params'} source - Fuente de datos a validar
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      // Reemplaza con datos sanitizados (strip de campos extra)
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 422, 'Datos de entrada inválidos', errors);
      }
      next(err);
    }
  };
};

module.exports = { validate };
