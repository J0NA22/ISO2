// src/services/customer.service.js
// Gestión de clientes y su historial de compras

const prisma = require('../config/database');

class CustomerService {
  async listCustomers({ page = 1, limit = 20, search } = {}) {
    const skip = (page - 1) * limit;
    const where = { isActive: true };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: limit, orderBy: { fullName: 'asc' } }),
      prisma.customer.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw Object.assign(new Error('Cliente no encontrado'), { statusCode: 404 });
    return customer;
  }

  async getPurchaseHistory(customerId) {
    await this.getCustomerById(customerId);
    return prisma.sale.findMany({
      where: { customerId, status: { not: 'CANCELLED' } },
      orderBy: { saleDate: 'desc' },
      include: { payment: true },
    });
  }

  async createCustomer(data) {
    return prisma.customer.create({ data });
  }

  async updateCustomer(id, data) {
    await this.getCustomerById(id);
    return prisma.customer.update({ where: { id }, data });
  }

  async deleteCustomer(id) {
    await this.getCustomerById(id);
    return prisma.customer.update({ where: { id }, data: { isActive: false } });
  }
}

module.exports = new CustomerService();
