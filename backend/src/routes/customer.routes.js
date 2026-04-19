// src/routes/customer.routes.js

const router = require('express').Router();
const ctrl = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { createCustomerSchema, updateCustomerSchema } = require('../validators/customer.validators');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/purchases', ctrl.getPurchaseHistory);
router.post('/', validate(createCustomerSchema), ctrl.create);
router.put('/:id', validate(updateCustomerSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
