// Controlador de ventas (RF1, RF3, RF4, RF5)
const saleService = require('../services/saleService');

class SaleController {
  async create(req, res, next) {
    try {
      const { items, ...saleData } = req.body;
      const sale = await saleService.createSale(saleData, items, req.user.id);
      res.status(201).json({ status: 'success', data: sale });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
      };
      const sales = await saleService.getAll(filters);
      res.json({ status: 'success', data: sales });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const sale = await saleService.getById(parseInt(req.params.id));
      res.json({ status: 'success', data: sale });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const sale = await saleService.cancel(parseInt(req.params.id));
      res.json({ status: 'success', data: sale, message: 'Venta cancelada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async getReceipt(req, res, next) {
    try {
      const receipt = await saleService.getReceipt(parseInt(req.params.id));
      res.json({ status: 'success', data: receipt });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SaleController();
