// Servicio de proveedores (RF33)
const providerRepository = require('../repositories/providerRepository');
const AppError = require('../utils/AppError');

class ProviderService {
  async getAll(search) {
    return await providerRepository.findAll(search);
  }

  async getById(id) {
    const provider = await providerRepository.findById(id);
    if (!provider) throw AppError.notFound('Proveedor no encontrado');
    return provider;
  }

  async create(data) {
    return await providerRepository.create(data);
  }

  async update(id, data) {
    const existing = await providerRepository.findById(id);
    if (!existing) throw AppError.notFound('Proveedor no encontrado');
    return await providerRepository.update(id, data);
  }

  async delete(id) {
    return await providerRepository.delete(id);
  }

  async getProducts(id) {
    const provider = await providerRepository.findById(id);
    if (!provider) throw AppError.notFound('Proveedor no encontrado');
    return await providerRepository.getProducts(id);
  }
}

module.exports = new ProviderService();
