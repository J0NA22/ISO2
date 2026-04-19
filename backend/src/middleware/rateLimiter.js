// src/middleware/rateLimiter.js
// Rate limiting — Protección contra fuerza bruta y DDoS básico

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');

/**
 * Límite general: 100 requests por IP cada 15 minutos
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,    // Retorna RateLimit-* headers
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Demasiadas solicitudes. Intenta de nuevo más tarde.');
  },
});

/**
 * Límite estricto para login: 5 intentos por IP cada 15 minutos
 * Mitiga ataques de fuerza bruta sobre credenciales
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(res, 429, 'Demasiados intentos de login. Espera 15 minutos antes de intentar de nuevo.');
  },
});

module.exports = { globalLimiter, loginLimiter };
