// src/utils/response.js
// Utilidad de respuestas HTTP estandarizadas — Responsabilidad Única (SOLID-S)

/**
 * Respuesta de éxito estándar
 */
const sendSuccess = (res, data, statusCode = 200, message = 'OK') => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Respuesta de lista paginada
 */
const sendPaginated = (res, data, meta) => {
  return res.status(200).json({
    success: true,
    data,
    meta, // { total, page, limit, totalPages }
  });
};

/**
 * Respuesta de error — SIN exponer stack traces en producción
 */
const sendError = (res, statusCode, message, details = null) => {
  const response = { success: false, message };
  // Solo en desarrollo se envían detalles del error
  if (details && process.env.NODE_ENV !== 'production') {
    response.details = details;
  }
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendPaginated, sendError };
