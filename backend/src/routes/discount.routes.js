// src/routes/discount.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/discount.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createDiscountSchema, updateDiscountSchema } = require('../validators/discount.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', requirePermission('discounts.create'), validate(createDiscountSchema), ctrl.create);
router.put('/:id', requirePermission('discounts.update'), validate(updateDiscountSchema), ctrl.update);
router.delete('/:id', requirePermission('discounts.delete'), ctrl.remove);

module.exports = router;
