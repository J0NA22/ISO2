// Rutas de productos
const { Router } = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// GET /api/products - Listar productos
router.get('/', (req, res, next) => productController.getAll(req, res, next));

// GET /api/products/categories - Obtener categorías
router.get('/categories', (req, res, next) => productController.getCategories(req, res, next));

// GET /api/products/barcode/:barcode - Buscar por código de barras
router.get('/barcode/:barcode', (req, res, next) => productController.getByBarcode(req, res, next));

// GET /api/products/:id - Detalle de producto
router.get('/:id', (req, res, next) => productController.getById(req, res, next));

// POST /api/products - Crear producto (admin/gerente)
router.post(
  '/',
  roleMiddleware('admin', 'gerente'),
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('sale_price').isFloat({ min: 0 }).withMessage('El precio de venta debe ser mayor a 0'),
    validate,
  ],
  (req, res, next) => productController.create(req, res, next)
);

// PUT /api/products/:id - Editar producto (admin/gerente)
router.put('/:id', roleMiddleware('admin', 'gerente'), (req, res, next) => productController.update(req, res, next));

// DELETE /api/products/:id - Eliminar producto (admin)
router.delete('/:id', roleMiddleware('admin'), (req, res, next) => productController.delete(req, res, next));

// --- Variantes ---
// GET /api/products/:id/variants
router.get('/:id/variants', (req, res, next) => productController.getVariants(req, res, next));

// POST /api/products/:id/variants
router.post(
  '/:id/variants',
  roleMiddleware('admin', 'gerente'),
  [
    body('size').notEmpty().withMessage('La talla es requerida'),
    body('color').notEmpty().withMessage('El color es requerido'),
    validate,
  ],
  (req, res, next) => productController.createVariant(req, res, next)
);

// PUT /api/products/variants/:variantId
router.put('/variants/:variantId', roleMiddleware('admin', 'gerente'), (req, res, next) => productController.updateVariant(req, res, next));

// DELETE /api/products/variants/:variantId
router.delete('/variants/:variantId', roleMiddleware('admin'), (req, res, next) => productController.deleteVariant(req, res, next));

module.exports = router;
