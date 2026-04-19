// src/middleware/errorHandler.js
// Manejador centralizado de errores — último middleware de Express
// Programación segura: NO expone detalles internos en producción

const logger = require('../utils/logger');

/**
 * Middleware de manejo de errores.
 * Captura cualquier error no manejado en controllers/services.
 * En producción: mensaje genérico. En desarrollo: detalles completos.
 */
const errorHandler = (err, req, res, next) => {
  // Log interno completo para diagnóstico (NUNCA al cliente)
  logger.error({
    err: { message: err.message, stack: err.stack, code: err.code },
    req: { method: req.method, url: req.originalUrl, user: req.user?.id },
  }, 'Unhandled error');

  // Errores de Prisma — convertir a mensajes amigables
  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con ese valor. Verifica los datos únicos.',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
    });
  }

  // Error HTTP explícito
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Error genérico — no revelar detalles en producción
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProd ? 'Error interno del servidor' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};

module.exports = { errorHandler };
