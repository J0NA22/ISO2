// Controlador de productos (RF7, RF8, RF9, RF13, RF14, RF32)
const productService = require('../services/productService');

class ProductController {
  async getAll(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        search: req.query.search,
        limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset) : undefined,
      };
      const products = await productService.getAll(filters);
      res.json({ status: 'success', data: products });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getById(parseInt(req.params.id));
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  async getByBarcode(req, res, next) {
    try {
      const product = await productService.getByBarcode(req.params.barcode);
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.create(req.body);
      res.status(201).json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.update(parseInt(req.params.id), req.body);
      res.json({ status: 'success', data: product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await productService.delete(parseInt(req.params.id));
      res.json({ status: 'success', message: 'Producto eliminado' });
    } catch (error) {
      next(error);
    }
  }

  // Variantes
  async getVariants(req, res, next) {
    try {
      const variants = await productService.getVariants(parseInt(req.params.id));
      res.json({ status: 'success', data: variants });
    } catch (error) {
      next(error);
    }
  }

  async createVariant(req, res, next) {
    try {
      const variant = await productService.createVariant(parseInt(req.params.id), req.body);
      res.status(201).json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }

  async updateVariant(req, res, next) {
    try {
      const variant = await productService.updateVariant(parseInt(req.params.variantId), req.body);
      res.json({ status: 'success', data: variant });
    } catch (error) {
      next(error);
    }
  }

  async deleteVariant(req, res, next) {
    try {
      await productService.deleteVariant(parseInt(req.params.variantId));
      res.json({ status: 'success', message: 'Variante eliminada' });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      res.json({ status: 'success', data: categories });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
