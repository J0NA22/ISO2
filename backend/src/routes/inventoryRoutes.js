// Rutas de inventario
const { Router } = require('express');
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();
router.use(authMiddleware);

// GET /api/inventory - Inventario completo
router.get('/', (req, res, next) => inventoryController.getInventory(req, res, next));

// GET /api/inventory/summary - Resumen
router.get('/summary', (req, res, next) => inventoryController.getSummary(req, res, next));

// GET /api/inventory/low-stock - Alertas de stock bajo
router.get('/low-stock', (req, res, next) => inventoryController.getLowStock(req, res, next));

// POST /api/inventory/entries - Registrar entrada
router.post('/entries', roleMiddleware('admin', 'gerente'), (req, res, next) => inventoryController.addEntry(req, res, next));

// GET /api/inventory/entries/:variantId - Historial de una variante
router.get('/entries/:variantId', (req, res, next) => inventoryController.getEntries(req, res, next));

module.exports = router;
