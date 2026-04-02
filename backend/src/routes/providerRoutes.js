// Rutas de proveedores
const { Router } = require('express');
const providerController = require('../controllers/providerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => providerController.getAll(req, res, next));
router.get('/:id', (req, res, next) => providerController.getById(req, res, next));
router.get('/:id/products', (req, res, next) => providerController.getProducts(req, res, next));
router.post('/', roleMiddleware('admin', 'gerente'), (req, res, next) => providerController.create(req, res, next));
router.put('/:id', roleMiddleware('admin', 'gerente'), (req, res, next) => providerController.update(req, res, next));
router.delete('/:id', roleMiddleware('admin'), (req, res, next) => providerController.delete(req, res, next));

module.exports = router;
