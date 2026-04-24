// src/routes/taxConfig.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/taxConfig.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createTaxSchema, updateTaxSchema } = require('../validators/taxConfig.validators');

router.use(authenticate);

// Consultar configuración activa — cualquier usuario autenticado
router.get('/active', ctrl.getActive);
// Listar todas las configuraciones — solo admin
router.get('/', requireRole('admin'), ctrl.listAll);
// Crear/actualizar configuración — solo admin
router.post('/', requireRole('admin'), validate(createTaxSchema), ctrl.create);
router.put('/:id', requireRole('admin'), validate(updateTaxSchema), ctrl.update);

module.exports = router;
