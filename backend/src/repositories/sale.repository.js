// src/repositories/sale.repository.js
// Capa de acceso a datos para ventas — Inversión de Dependencias (SOLID-D)
// Los servicios dependen de esta abstracción, no de Prisma directamente.

const prisma = require('../config/database');

const saleInclude = {
  customer: true,
  user: { select: { id: true, fullName: true, username: true } },
  discount: true,
  details: {
    include: {
      variant: {
        include: { product: true, size: true, color: true },
      },
    },
  },
  payment: true,
  receipts: true,
};

const SaleRepository = {
  findById: (id) =>
    prisma.sale.findUnique({ where: { id }, include: saleInclude }),

  findMany: ({ where = {}, skip = 0, take = 20 } = {}) =>
    prisma.sale.findMany({
      where, skip, take,
      orderBy: { saleDate: 'desc' },
      include: {
        customer: { select: { id: true, fullName: true } },
        user: { select: { id: true, fullName: true } },
        payment: { select: { method: true } },
      },
    }),

  count: (where = {}) => prisma.sale.count({ where }),

  create: (data, tx) => (tx || prisma).sale.create({ data }),

  update: (id, data, tx) => (tx || prisma).sale.update({ where: { id }, data }),

  createDetail: (data, tx) => (tx || prisma).saleDetail.create({ data }),

  createPayment: (data, tx) => (tx || prisma).payment.create({ data }),

  createReceipt: (data, tx) => (tx || prisma).receipt.create({ data }),

  decrementStock: (variantId, qty, tx) =>
    (tx || prisma).stock.update({
      where: { variantId },
      data: { quantity: { decrement: qty }, lastUpdated: new Date() },
    }),

  incrementStock: (variantId, qty, tx) =>
    (tx || prisma).stock.update({
      where: { variantId },
      data: { quantity: { increment: qty }, lastUpdated: new Date() },
    }),

  findStockByVariant: (variantId) =>
    prisma.stock.findUnique({ where: { variantId } }),

  findVariantWithDetails: (id) =>
    prisma.variant.findUnique({
      where: { id },
      include: { product: true, size: true, color: true },
    }),

  findDiscount: (id) =>
    prisma.discount.findUnique({ where: { id, isActive: true } }),

  findActiveTaxConfig: () =>
    prisma.taxConfig.findFirst({ where: { isActive: true } }),
};

module.exports = SaleRepository;
