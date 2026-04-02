// Rutas de exportación
const { Router } = require('express');
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin', 'gerente'));

router.get('/sales', (req, res, next) => exportController.exportSales(req, res, next));
router.get('/inventory', (req, res, next) => exportController.exportInventory(req, res, next));
router.get('/top-products', (req, res, next) => exportController.exportTopProducts(req, res, next));

module.exports = router;
