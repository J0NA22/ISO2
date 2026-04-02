// Clase de error personalizada para la aplicación
// Separa errores operacionales de errores de programación (SRP)
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  // Errores comunes como métodos estáticos (factory pattern)
  static badRequest(message, details) {
    return new AppError(message || 'Solicitud inválida', 400, details);
  }

  static unauthorized(message) {
    return new AppError(message || 'No autorizado', 401);
  }

  static forbidden(message) {
    return new AppError(message || 'Acceso denegado', 403);
  }

  static notFound(message) {
    return new AppError(message || 'Recurso no encontrado', 404);
  }

  static conflict(message) {
    return new AppError(message || 'Conflicto con el estado actual', 409);
  }

  static internal(message) {
    return new AppError(message || 'Error interno del servidor', 500);
  }
}

module.exports = AppError;
