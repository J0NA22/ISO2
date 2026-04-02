// Rutas de clientes
const { Router } = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res, next) => customerController.getAll(req, res, next));
router.get('/:id', (req, res, next) => customerController.getById(req, res, next));
router.get('/:id/purchases', (req, res, next) => customerController.getPurchaseHistory(req, res, next));

router.post(
  '/',
  [
    body('first_name').notEmpty().withMessage('El nombre es requerido'),
    body('last_name').notEmpty().withMessage('El apellido es requerido'),
    validate,
  ],
  (req, res, next) => customerController.create(req, res, next)
);

router.put('/:id', (req, res, next) => customerController.update(req, res, next));
router.delete('/:id', (req, res, next) => customerController.delete(req, res, next));

module.exports = router;
