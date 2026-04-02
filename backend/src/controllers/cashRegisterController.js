// Controlador de caja registradora (RF30)
const cashRegisterService = require('../services/cashRegisterService');

class CashRegisterController {
  async open(req, res, next) {
    try {
      const { opening_amount, currency } = req.body;
      const register = await cashRegisterService.open(req.user.id, opening_amount, currency);
      res.status(201).json({ status: 'success', data: register });
    } catch (error) {
      next(error);
    }
  }

  async close(req, res, next) {
    try {
      const { closing_amount } = req.body;
      const result = await cashRegisterService.close(req.user.id, closing_amount);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getOpen(req, res, next) {
    try {
      const register = await cashRegisterService.getOpen(req.user.id);
      res.json({ status: 'success', data: register });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        status: req.query.status,
      };
      const history = await cashRegisterService.getHistory(filters);
      res.json({ status: 'success', data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CashRegisterController();
