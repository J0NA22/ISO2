// Rutas de autenticación
const { Router } = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

const router = Router();

// POST /api/auth/login - Iniciar sesión (público)
router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('El usuario es requerido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    validate,
  ],
  (req, res, next) => authController.login(req, res, next)
);

// POST /api/auth/register - Registrar usuario (solo admin)
router.post(
  '/register',
  authMiddleware,
  [
    body('username').notEmpty().withMessage('El usuario es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('first_name').notEmpty().withMessage('El nombre es requerido'),
    body('last_name').notEmpty().withMessage('El apellido es requerido'),
    body('role_id').isInt().withMessage('El rol es requerido'),
    validate,
  ],
  (req, res, next) => authController.register(req, res, next)
);

// GET /api/auth/profile - Obtener perfil actual
router.get('/profile', authMiddleware, (req, res, next) => authController.getProfile(req, res, next));

module.exports = router;
