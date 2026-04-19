// src/routes/supplier.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createSupplierSchema, updateSupplierSchema } = require('../validators/supplier.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', requireRole('Administrador'), validate(createSupplierSchema), ctrl.create);
router.put('/:id', requireRole('Administrador'), validate(updateSupplierSchema), ctrl.update);
router.delete('/:id', requireRole('Administrador'), ctrl.remove);

module.exports = router;
