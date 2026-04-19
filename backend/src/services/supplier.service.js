// src/services/supplier.service.js

const prisma = require('../config/database');

class SupplierService {
  async listSuppliers({ page = 1, limit = 20, search } = {}) {
    const skip = (page - 1) * limit;
    const where = { isActive: true };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.supplier.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.supplier.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSupplierById(id) {
    const s = await prisma.supplier.findUnique({ where: { id } });
    if (!s) throw Object.assign(new Error('Proveedor no encontrado'), { statusCode: 404 });
    return s;
  }

  async createSupplier(data) {
    return prisma.supplier.create({ data });
  }

  async updateSupplier(id, data) {
    await this.getSupplierById(id);
    return prisma.supplier.update({ where: { id }, data });
  }

  async deleteSupplier(id) {
    await this.getSupplierById(id);
    return prisma.supplier.update({ where: { id }, data: { isActive: false } });
  }
}

module.exports = new SupplierService();
