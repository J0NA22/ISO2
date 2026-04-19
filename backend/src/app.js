// src/app.js
// Configuración de Express con todas las medidas de seguridad

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes/index');

const app = express();

// ── SEGURIDAD: Headers HTTP seguros ──────────────────────────
// Helmet configura automáticamente: X-Content-Type-Options,
// X-Frame-Options, X-XSS-Protection, HSTS, CSP, etc.
app.use(helmet());

// ── SEGURIDAD: CORS restrictivo ───────────────────────────────
// Solo permite requests desde el frontend declarado en .env
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, móviles) solo en desarrollo
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS: origen no permitido'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── LOGS HTTP seguros ─────────────────────────────────────────
app.use(pinoHttp({
  logger,
  // Ocultar authorization de los logs
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    }),
  },
}));

// ── PARSING ───────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limitar tamaño para prevenir DoS
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ── RATE LIMITING GLOBAL ──────────────────────────────────────
app.use('/api', globalLimiter);

// ── RUTAS ─────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── HEALTH CHECK ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint no encontrado' });
});

// ── ERROR HANDLER CENTRALIZADO ────────────────────────────────
app.use(errorHandler);

module.exports = app;
