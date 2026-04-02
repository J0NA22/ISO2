// Rutas de reportes
const { Router } = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();
router.use(authMiddleware);

router.get('/dashboard', (req, res, next) => reportController.dashboard(req, res, next));
router.get('/sales', roleMiddleware('admin', 'gerente'), (req, res, next) => reportController.salesReport(req, res, next));
router.get('/top-products', roleMiddleware('admin', 'gerente'), (req, res, next) => reportController.topProducts(req, res, next));
router.get('/inventory', roleMiddleware('admin', 'gerente'), (req, res, next) => reportController.inventoryReport(req, res, next));

module.exports = router;
