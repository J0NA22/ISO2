// src/routes/cashClosing.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/cashClosing.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { cashClosingSchema } = require('../validators/cashClosing.validators');

router.use(authenticate);

router.get('/', requirePermission('cash.read'), ctrl.list);
router.get('/:id', requirePermission('cash.read'), ctrl.getById);
router.post('/', requirePermission('cash.create'), validate(cashClosingSchema), ctrl.create);

module.exports = router;
