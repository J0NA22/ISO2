// src/services/discount.service.js
// CRUD de descuentos — Abierto/Cerrado: nuevos tipos sin modificar lógica core

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');

class DiscountService {
  async listDiscounts({ active } = {}) {
    const where = active !== undefined ? { isActive: active === 'true' } : {};
    return prisma.discount.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async getById(id) {
    const discount = await prisma.discount.findUnique({ where: { id } });
    if (!discount) throw Object.assign(new Error('Descuento no encontrado'), { statusCode: 404 });
    return discount;
  }

  async createDiscount(data, userId, ipAddress) {
    const discount = await prisma.discount.create({
      data: {
        name: data.name.trim(),
        type: data.type,        // 'PERCENTAGE' | 'FIXED'
        value: data.value,
        isActive: data.isActive ?? true,
      },
    });

    await auditLog({ userId, action: 'CREATE', entity: 'discount', entityId: discount.id, ipAddress });
    return discount;
  }

  async updateDiscount(id, data, userId, ipAddress) {
    await this.getById(id);
    const updated = await prisma.discount.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    await auditLog({ userId, action: 'UPDATE', entity: 'discount', entityId: id, ipAddress });
    return updated;
  }

  async deleteDiscount(id, userId, ipAddress) {
    await this.getById(id);
    // Eliminación lógica
    const updated = await prisma.discount.update({
      where: { id },
      data: { isActive: false },
    });
    await auditLog({ userId, action: 'DELETE', entity: 'discount', entityId: id, ipAddress });
    return updated;
  }
}

module.exports = new DiscountService();
