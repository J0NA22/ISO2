// Rutas de ventas
const { Router } = require('express');
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

const router = Router();
router.use(authMiddleware);

// POST /api/sales - Registrar venta
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('payment_method').notEmpty().withMessage('El método de pago es requerido'),
    validate,
  ],
  (req, res, next) => saleController.create(req, res, next)
);

// GET /api/sales - Listar ventas
router.get('/', (req, res, next) => saleController.getAll(req, res, next));

// GET /api/sales/:id - Detalle de venta
router.get('/:id', (req, res, next) => saleController.getById(req, res, next));

// PUT /api/sales/:id/cancel - Cancelar venta (admin/gerente)
router.put('/:id/cancel', roleMiddleware('admin', 'gerente'), (req, res, next) => saleController.cancel(req, res, next));

// GET /api/sales/:id/receipt - Comprobante de venta
router.get('/:id/receipt', (req, res, next) => saleController.getReceipt(req, res, next));

module.exports = router;
