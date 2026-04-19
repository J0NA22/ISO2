// src/routes/product.routes.js
// Rutas de productos con RBAC por permiso

const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/rbacMiddleware');
const { validate } = require('../middleware/validate');
const { createProductSchema, updateProductSchema, createVariantSchema } = require('../validators/product.validators');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Catálogos (lectura libre para todos los usuarios)
router.get('/categories', ctrl.listCategories);
router.get('/sizes', ctrl.listSizes);
router.get('/colors', ctrl.listColors);

// Búsqueda por código de barras
router.get('/barcode/:code', ctrl.searchByBarcode);

// CRUD de productos
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', requirePermission('products.create'), validate(createProductSchema), ctrl.create);
router.put('/:id', requirePermission('products.update'), validate(updateProductSchema), ctrl.update);
router.delete('/:id', requirePermission('products.delete'), ctrl.remove);

// Variantes
router.post('/:id/variants', requirePermission('products.create'), validate(createVariantSchema), ctrl.createVariant);

module.exports = router;
