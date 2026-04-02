// Rutas de usuarios
const { Router } = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = Router();
router.use(authMiddleware);

// Solo admin puede gestionar usuarios
router.get('/', roleMiddleware('admin'), (req, res, next) => userController.getAll(req, res, next));
router.get('/roles', (req, res, next) => userController.getRoles(req, res, next));
router.get('/:id', roleMiddleware('admin'), (req, res, next) => userController.getById(req, res, next));
router.put('/:id', roleMiddleware('admin'), (req, res, next) => userController.update(req, res, next));
router.put('/:id/password', roleMiddleware('admin'), (req, res, next) => userController.changePassword(req, res, next));
router.delete('/:id', roleMiddleware('admin'), (req, res, next) => userController.delete(req, res, next));

module.exports = router;
