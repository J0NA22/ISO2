// Controlador de inventario (RF10, RF11, RF12)
const inventoryService = require('../services/inventoryService');

class InventoryController {
  async getInventory(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        lowStock: req.query.lowStock === 'true',
      };
      const inventory = await inventoryService.getInventory(filters);
      res.json({ status: 'success', data: inventory });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req, res, next) {
    try {
      const items = await inventoryService.getLowStock();
      res.json({ status: 'success', data: items });
    } catch (error) {
      next(error);
    }
  }

  async addEntry(req, res, next) {
    try {
      const entry = await inventoryService.addEntry(req.body, req.user.id);
      res.status(201).json({ status: 'success', data: entry });
    } catch (error) {
      next(error);
    }
  }

  async getEntries(req, res, next) {
    try {
      const entries = await inventoryService.getEntries(parseInt(req.params.variantId));
      res.json({ status: 'success', data: entries });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await inventoryService.getSummary();
      res.json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
