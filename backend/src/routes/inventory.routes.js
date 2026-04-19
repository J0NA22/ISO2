// src/routes/inventory.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/inventory.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createInventoryEntrySchema } = require('../validators/inventory.validators');

router.use(authenticate);

router.get('/stock', ctrl.getFullInventory);
router.get('/stock/alerts', ctrl.getLowStockAlerts);
router.get('/entries', ctrl.listEntries);
router.get('/entries/:id', ctrl.getEntryById);
router.post('/entries', requirePermission('inventory.create'), validate(createInventoryEntrySchema), ctrl.registerEntry);

module.exports = router;
