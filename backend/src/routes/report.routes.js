// src/routes/report.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/report.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');

router.use(authenticate);
router.use(requirePermission('reports.view'));

router.get('/dashboard', ctrl.dashboard);
router.get('/sales', ctrl.salesReport);
router.get('/top-products', ctrl.topProducts);
router.get('/inventory', ctrl.inventoryReport);

module.exports = router;
