// src/utils/logger.js
// Logger seguro con Pino — NO registra contraseñas ni tokens

const pino = require('pino');

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  // Ocultar campos sensibles en los logs (OBLIGATORIO seguridad)
  redact: {
    paths: ['*.password', '*.passwordHash', '*.token', '*.authorization'],
    censor: '[REDACTED]',
  },
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

module.exports = logger;
