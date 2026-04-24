// src/repositories/product.repository.js
// Acceso a datos para productos, variantes y catálogos

const prisma = require('../config/database');

const productInclude = {
  category: true,
  variants: {
    include: { size: true, color: true, stock: true },
    orderBy: [{ size: { sortOrder: 'asc' } }, { color: { name: 'asc' } }],
  },
  suppliers: { include: { supplier: true } },
};

const ProductRepository = {
  findMany: ({ where = {}, skip = 0, take = 20 } = {}) =>
    prisma.product.findMany({
      where, skip, take,
      orderBy: { name: 'asc' },
      include: {
        category: { select: { id: true, name: true } },
        variants: {
          where: { isActive: true },
          include: { size: true, color: true, stock: true },
        },
      },
    }),

  count: (where = {}) => prisma.product.count({ where }),

  findById: (id) =>
    prisma.product.findUnique({ where: { id }, include: productInclude }),

  findByBarcode: (barcode) =>
    prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        variants: { include: { size: true, color: true, stock: true } },
      },
    }),

  create: (data) => prisma.product.create({ data, include: { category: true } }),

  update: (id, data) => prisma.product.update({ where: { id }, data }),

  // Variantes
  createVariant: (data, tx) => (tx || prisma).variant.create({
    data,
    include: { size: true, color: true },
  }),

  createStock: (variantId, qty = 0, tx) =>
    (tx || prisma).stock.create({ data: { variantId, quantity: qty } }),

  // Catálogos
  findCategories: (where = { isActive: true }) =>
    prisma.category.findMany({ where, orderBy: { name: 'asc' } }),

  createCategory: (data) => prisma.category.create({ data }),

  updateCategory: (id, data) => prisma.category.update({ where: { id }, data }),

  findSizes: () => prisma.size.findMany({ orderBy: { sortOrder: 'asc' } }),

  createSize: (data) => prisma.size.create({ data }),

  updateSize: (id, data) => prisma.size.update({ where: { id }, data }),

  findColors: () => prisma.color.findMany({ orderBy: { name: 'asc' } }),

  createColor: (data) => prisma.color.create({ data }),

  updateColor: (id, data) => prisma.color.update({ where: { id }, data }),
};

module.exports = ProductRepository;
