// Servicio de productos (RF7, RF8, RF9) - Lógica de negocio
const productRepository = require('../repositories/productRepository');
const variantRepository = require('../repositories/variantRepository');
const AppError = require('../utils/AppError');
const { generateSKU } = require('../utils/barcode');

class ProductService {
  // Obtener todos los productos
  async getAll(filters) {
    return await productRepository.findAll(filters);
  }

  // Obtener producto por ID con variantes
  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw AppError.notFound('Producto no encontrado');
    }
    return product;
  }

  // Buscar por código de barras (RF32)
  async getByBarcode(barcode) {
    const product = await productRepository.findByBarcode(barcode);
    if (!product) {
      throw AppError.notFound('Producto no encontrado con ese código de barras');
    }
    return product;
  }

  // Crear producto (RF7)
  async create(data) {
    const product = await productRepository.create(data);
    return product;
  }

  // Actualizar producto (RF8)
  async update(id, data) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Producto no encontrado');
    }
    return await productRepository.update(id, data);
  }

  // Eliminar producto (RF9 - soft delete)
  async delete(id) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw AppError.notFound('Producto no encontrado');
    }
    return await productRepository.delete(id);
  }

  // Obtener variantes de un producto (RF13, RF14, RF15)
  async getVariants(productId) {
    return await variantRepository.findByProductId(productId);
  }

  // Crear variante
  async createVariant(productId, data) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Producto no encontrado');
    }

    // Generar SKU automáticamente si no se proporcionó
    if (!data.sku) {
      data.sku = generateSKU(product.name, data.size, data.color);
    }

    data.product_id = productId;
    return await variantRepository.create(data);
  }

  // Actualizar variante
  async updateVariant(variantId, data) {
    const existing = await variantRepository.findById(variantId);
    if (!existing) {
      throw AppError.notFound('Variante no encontrada');
    }
    return await variantRepository.update(variantId, data);
  }

  // Eliminar variante
  async deleteVariant(variantId) {
    return await variantRepository.delete(variantId);
  }

  // Obtener categorías
  async getCategories() {
    return await productRepository.getCategories();
  }
}

module.exports = new ProductService();
