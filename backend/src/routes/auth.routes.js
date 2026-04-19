// src/routes/auth.routes.js
// Rutas de autenticación con rate limiting estricto en login

const router = require('express').Router();
const { login, logout, me } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimiter');
const { loginSchema } = require('../validators/auth.validators');

// POST /api/v1/auth/login — rate limit estricto (5/15min por IP)
router.post('/login', loginLimiter, validate(loginSchema), login);

// POST /api/v1/auth/logout — requiere estar autenticado
router.post('/logout', authenticate, logout);

// GET /api/v1/auth/me — retorna usuario del token
router.get('/me', authenticate, me);

module.exports = router;
