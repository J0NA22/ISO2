// Middleware de validación de datos usando express-validator
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware que verifica los resultados de las validaciones
 * Se usa después de las reglas de express-validator en las rutas
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((e) => e.msg);
    return next(AppError.badRequest('Datos inválidos', errorMessages));
  }
  next();
}

module.exports = { validate };
