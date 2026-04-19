// src/utils/auditLogger.js
// Registro de auditoría en base de datos — trazabilidad de acciones

const prisma = require('../config/database');
const logger = require('./logger');

/**
 * Registra una acción en la tabla audit_log
 * @param {object} params
 * @param {number} params.userId - Usuario que ejecutó la acción
 * @param {string} params.action - CREATE | UPDATE | DELETE | LOGIN | LOGOUT | CANCEL
 * @param {string} params.entity - Nombre de la entidad (ej: 'sale', 'product')
 * @param {number} [params.entityId] - ID del registro afectado
 * @param {object} [params.details] - Datos adicionales (before/after)
 * @param {string} [params.ipAddress] - IP del cliente
 */
async function auditLog({ userId, action, entity, entityId = null, details = null, ipAddress = null }) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch (err) {
    // El fallo de auditoría NO debe interrumpir la operación principal
    logger.error({ err }, 'Error writing to audit_log');
  }
}

module.exports = { auditLog };
