// src/routes/user.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createUserSchema, updateUserSchema, changePasswordSchema } = require('../validators/user.validators');

router.use(authenticate);

// Solo admin puede gestionar usuarios
router.get('/', requireRole('Administrador'), ctrl.list);
router.get('/roles', ctrl.listRoles); // Todos pueden ver los roles (para formularios)
router.get('/:id', requireRole('Administrador'), ctrl.getById);
router.post('/', requireRole('Administrador'), validate(createUserSchema), ctrl.create);
router.put('/:id', requireRole('Administrador'), validate(updateUserSchema), ctrl.update);

// Cualquier usuario puede cambiar su propia contraseña
router.post('/change-password', validate(changePasswordSchema), ctrl.changePassword);

module.exports = router;
