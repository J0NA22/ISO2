// src/routes/product.routes.js
// Rutas de productos con RBAC por permiso
// Incluye CRUD completo de catálogos: categorías, tallas y colores

const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission, requireRole } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
} = require('../validators/product.validators');
const { categorySchema, sizeSchema, colorSchema } = require('../validators/catalog.validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// ── CATÁLOGOS ────────────────────────────────────────────────
// Lectura libre (todos los usuarios autenticados)
router.get('/categories', ctrl.listCategories);
router.get('/sizes', ctrl.listSizes);
router.get('/colors', ctrl.listColors);

// CRUD de categorías — solo admin/manager
router.post('/categories', requireRole('admin', 'manager'), validate(categorySchema), ctrl.createCategory);
router.put('/categories/:id', requireRole('admin', 'manager'), validate(categorySchema), ctrl.updateCategory);

// CRUD de tallas — solo admin/manager
router.post('/sizes', requireRole('admin', 'manager'), validate(sizeSchema), ctrl.createSize);
router.put('/sizes/:id', requireRole('admin', 'manager'), validate(sizeSchema), ctrl.updateSize);

// CRUD de colores — solo admin/manager
router.post('/colors', requireRole('admin', 'manager'), validate(colorSchema), ctrl.createColor);
router.put('/colors/:id', requireRole('admin', 'manager'), validate(colorSchema), ctrl.updateColor);

// ── BÚSQUEDA POR CÓDIGO ──────────────────────────────────────
router.get('/barcode/:code', ctrl.searchByBarcode);

// ── CRUD DE PRODUCTOS ────────────────────────────────────────
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', requirePermission('products.create'), validate(createProductSchema), ctrl.create);
router.put('/:id', requirePermission('products.update'), validate(updateProductSchema), ctrl.update);
router.delete('/:id', requirePermission('products.delete'), ctrl.remove);

// ── VARIANTES ────────────────────────────────────────────────
router.post('/:id/variants', requirePermission('products.create'), validate(createVariantSchema), ctrl.createVariant);

module.exports = router;
