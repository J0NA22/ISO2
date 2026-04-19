// src/middleware/authMiddleware.js
// Verificación de JWT — Autenticación (SOLID-S, SOLID-I)
// Solo valida el token. La autorización por roles es otro middleware.

const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { sendError } = require('../utils/response');

/**
 * Middleware de autenticación JWT.
 * Extrae el token del header Authorization: Bearer <token>
 * Agrega req.user con { id, username, roleId, permissions }
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Token de acceso requerido');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { id, username, roleId, role, permissions }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expirado. Vuelve a iniciar sesión.');
    }
    // No revelar si el token es inválido o malformado
    return sendError(res, 401, 'No autorizado');
  }
};

module.exports = { authenticate };
