// Rutas de caja registradora
const { Router } = require('express');
const cashRegisterController = require('../controllers/cashRegisterController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();
router.use(authMiddleware);

router.post('/open', (req, res, next) => cashRegisterController.open(req, res, next));
router.put('/close', (req, res, next) => cashRegisterController.close(req, res, next));
router.get('/current', (req, res, next) => cashRegisterController.getOpen(req, res, next));
router.get('/history', (req, res, next) => cashRegisterController.getHistory(req, res, next));

module.exports = router;
