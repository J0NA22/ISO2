// Middleware centralizado de manejo de errores (SRP)
// Captura todos los errores y los formatea consistentemente
const env = require('../config/env');

function errorHandler(err, req, res, next) {
  // Valores por defecto
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // En desarrollo, mostrar más detalles
  if (env.nodeEnv === 'development') {
    console.error('❌ Error:', err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      details: err.details || null,
      stack: err.stack,
    });
  }

  // En producción, ocultar detalles internos
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      details: err.details || null,
    });
  }

  // Errores no operacionales (bugs) - no exponer detalles
  console.error('❌ ERROR CRÍTICO:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
}

module.exports = errorHandler;
