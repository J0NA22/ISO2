// Middleware de restricción por roles (RF23, RF24)
// Verifica que el usuario tenga el rol necesario para acceder al recurso
const AppError = require('../utils/AppError');

/**
 * Crea un middleware que restringe el acceso a roles específicos
 * @param  {...string} allowedRoles - Roles permitidos ('admin', 'gerente', 'vendedor')
 * @returns {Function} Middleware de Express
 */
function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    // El middleware de auth debe ejecutarse antes
    if (!req.user) {
      return next(AppError.unauthorized('Debe iniciar sesión primero'));
    }

    // Verificar si el rol del usuario está en los permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Acceso denegado. Se requiere rol: ${allowedRoles.join(' o ')}`
        )
      );
    }

    next();
  };
}

module.exports = roleMiddleware;
