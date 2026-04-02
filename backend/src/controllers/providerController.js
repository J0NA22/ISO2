// Controlador de proveedores (RF33)
const providerService = require('../services/providerService');

class ProviderController {
  async getAll(req, res, next) {
    try {
      const providers = await providerService.getAll(req.query.search);
      res.json({ status: 'success', data: providers });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const provider = await providerService.getById(parseInt(req.params.id));
      res.json({ status: 'success', data: provider });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const provider = await providerService.create(req.body);
      res.status(201).json({ status: 'success', data: provider });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const provider = await providerService.update(parseInt(req.params.id), req.body);
      res.json({ status: 'success', data: provider });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await providerService.delete(parseInt(req.params.id));
      res.json({ status: 'success', message: 'Proveedor eliminado' });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const products = await providerService.getProducts(parseInt(req.params.id));
      res.json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProviderController();
