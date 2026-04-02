// Servicio de clientes (RF16, RF17)
const customerRepository = require('../repositories/customerRepository');
const AppError = require('../utils/AppError');

class CustomerService {
  async getAll(search) {
    return await customerRepository.findAll(search);
  }

  async getById(id) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw AppError.notFound('Cliente no encontrado');
    return customer;
  }

  async create(data) {
    return await customerRepository.create(data);
  }

  async update(id, data) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw AppError.notFound('Cliente no encontrado');
    return await customerRepository.update(id, data);
  }

  async delete(id) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw AppError.notFound('Cliente no encontrado');
    return await customerRepository.delete(id);
  }

  // Historial de compras (RF17)
  async getPurchaseHistory(customerId) {
    const customer = await customerRepository.findById(customerId);
    if (!customer) throw AppError.notFound('Cliente no encontrado');
    return await customerRepository.getPurchaseHistory(customerId);
  }
}

module.exports = new CustomerService();
