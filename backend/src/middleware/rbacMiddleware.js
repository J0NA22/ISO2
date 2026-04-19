// src/middleware/rbacMiddleware.js
// Control de acceso basado en roles (Role-Based Access Control)
// Separado del authMiddleware — Segregación de Interfaces (SOLID-I)

const { sendError } = require('../utils/response');

/**
 * Crea un middleware que verifica si el usuario tiene el permiso requerido.
 * Los permisos se almacenan como JSONB en la tabla roles:
 * { "sales.create": true, "products.delete": false, ... }
 *
 * @param {string} permission - Permiso requerido (ej: 'sales.create')
 * @returns Express middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'No autenticado');
    }

    const permissions = req.user.permissions || {};

    if (permissions[permission] !== true) {
      return sendError(res, 403, 'No tienes permiso para realizar esta acción');
    }

    next();
  };
};

/**
 * Verifica que el usuario tenga uno de los roles indicados.
 * Útil cuando el acceso es por rol, no por permiso específico.
 *
 * @param {...string} roles - Nombres de roles permitidos
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'No autenticado');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Acceso denegado para tu rol');
    }

    next();
  };
};

module.exports = { requirePermission, requireRole };
