// src/routes/index.js
// Router principal que agrega todas las rutas bajo /api/v1

const router = require('express').Router();

router.use('/auth',       require('./auth.routes'));
router.use('/products',   require('./product.routes'));
router.use('/sales',      require('./sale.routes'));
router.use('/inventory',  require('./inventory.routes'));
router.use('/customers',  require('./customer.routes'));
router.use('/users',      require('./user.routes'));
router.use('/reports',    require('./report.routes'));
router.use('/suppliers',  require('./supplier.routes'));
router.use('/cash',       require('./cashClosing.routes'));
router.use('/discounts',  require('./discount.routes'));
router.use('/tax-config', require('./taxConfig.routes'));

module.exports = router;
