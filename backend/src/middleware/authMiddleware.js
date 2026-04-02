// Middleware de autenticación JWT (RF22)
// Verifica que el usuario tenga un token válido
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

function authMiddleware(req, res, next) {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Token de acceso requerido');
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, env.jwt.secret);

    // Agregar datos del usuario al request
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      roleId: decoded.roleId,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Token inválido'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Token expirado'));
    }
    next(error);
  }
}

module.exports = authMiddleware;
