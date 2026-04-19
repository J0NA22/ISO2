// src/routes/sale.routes.js
// Rutas de ventas

const router = require('express').Router();
const ctrl = require('../controllers/sale.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createSaleSchema, completeSaleSchema, cancelSaleSchema } = require('../validators/sale.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', requirePermission('sales.create'), validate(createSaleSchema), ctrl.create);
router.post('/calculate', requirePermission('sales.create'), ctrl.calculateTotals); // Preview de totales
router.patch('/:id/complete', requirePermission('sales.create'), validate(completeSaleSchema), ctrl.complete);
router.patch('/:id/cancel', requirePermission('sales.cancel'), validate(cancelSaleSchema), ctrl.cancel);

module.exports = router;
