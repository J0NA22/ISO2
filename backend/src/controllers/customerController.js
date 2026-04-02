// Controlador de clientes (RF16, RF17)
const customerService = require('../services/customerService');

class CustomerController {
  async getAll(req, res, next) {
    try {
      const customers = await customerService.getAll(req.query.search);
      res.json({ status: 'success', data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const customer = await customerService.getById(parseInt(req.params.id));
      res.json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const customer = await customerService.create(req.body);
      res.status(201).json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const customer = await customerService.update(parseInt(req.params.id), req.body);
      res.json({ status: 'success', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await customerService.delete(parseInt(req.params.id));
      res.json({ status: 'success', message: 'Cliente eliminado' });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseHistory(req, res, next) {
    try {
      const history = await customerService.getPurchaseHistory(parseInt(req.params.id));
      res.json({ status: 'success', data: history });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
