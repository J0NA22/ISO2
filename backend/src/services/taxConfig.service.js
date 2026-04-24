// src/services/taxConfig.service.js
// Gestión de configuración de impuestos

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');

class TaxConfigService {
  async getActiveTax() {
    const tax = await prisma.taxConfig.findFirst({ where: { isActive: true } });
    if (!tax) throw Object.assign(new Error('No hay configuración de impuesto activa'), { statusCode: 404 });
    return tax;
  }

  async listAll() {
    return prisma.taxConfig.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  async createTax(data, userId, ipAddress) {
    // Desactivar todas las anteriores si esta es activa
    if (data.isActive) {
      await prisma.taxConfig.updateMany({ where: { isActive: true }, data: { isActive: false } });
    }

    const tax = await prisma.taxConfig.create({
      data: {
        name: data.name.trim(),
        rate: data.rate,
        isActive: data.isActive ?? true,
        updatedBy: userId,
      },
    });

    await auditLog({ userId, action: 'CREATE', entity: 'tax_config', entityId: tax.id, details: { rate: tax.rate }, ipAddress });
    return tax;
  }

  async updateTax(id, data, userId, ipAddress) {
    const before = await prisma.taxConfig.findUnique({ where: { id } });
    if (!before) throw Object.assign(new Error('Configuración no encontrada'), { statusCode: 404 });

    // Si se activa esta, desactivar las demás
    if (data.isActive === true) {
      await prisma.taxConfig.updateMany({ where: { isActive: true, id: { not: id } }, data: { isActive: false } });
    }

    const updated = await prisma.taxConfig.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.rate !== undefined && { rate: data.rate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedBy: userId,
      },
    });

    await auditLog({
      userId, action: 'UPDATE', entity: 'tax_config', entityId: id,
      details: { before: before.rate, after: data.rate }, ipAddress,
    });
    return updated;
  }
}

module.exports = new TaxConfigService();
