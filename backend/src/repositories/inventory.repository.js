// src/repositories/inventory.repository.js
// Acceso a datos para inventario y entradas

const prisma = require('../config/database');

const InventoryRepository = {
  findStock: ({ where = {}, skip = 0, take = 1000 } = {}) =>
    prisma.stock.findMany({
      where,
      skip, take,
      include: {
        variant: {
          include: {
            product: { include: { category: true } },
            size: true,
            color: true,
          },
        },
      },
      orderBy: { quantity: 'asc' },
    }),

  getLowStockAlerts: () => prisma.$queryRaw`
    SELECT
      s.id as stock_id,
      s.quantity,
      v.id as variant_id,
      v.sku,
      v.min_threshold,
      p.name as product_name,
      sz.name as size_name,
      c.name as color_name,
      c.hex_code
    FROM pos_system.stock s
    JOIN pos_system.variants v ON s.variant_id = v.id
    JOIN pos_system.products p ON v.product_id = p.id
    JOIN pos_system.sizes sz ON v.size_id = sz.id
    JOIN pos_system.colors c ON v.color_id = c.id
    WHERE s.quantity <= v.min_threshold
      AND v.is_active = true
      AND p.status = 'ACTIVE'
    ORDER BY s.quantity ASC
  `,

  findEntries: ({ where = {}, skip = 0, take = 20 } = {}) =>
    prisma.inventoryEntry.findMany({
      where, skip, take,
      orderBy: { entryDate: 'desc' },
      include: {
        supplier: { select: { id: true, name: true } },
        user: { select: { id: true, fullName: true } },
      },
    }),

  countEntries: (where = {}) => prisma.inventoryEntry.count({ where }),

  findEntryById: (id) =>
    prisma.inventoryEntry.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: { select: { id: true, fullName: true } },
        details: {
          include: {
            variant: { include: { product: true, size: true, color: true } },
          },
        },
      },
    }),

  createEntry: (data, tx) => (tx || prisma).inventoryEntry.create({ data }),

  createEntryDetail: (data, tx) => (tx || prisma).entryDetail.create({ data }),

  upsertStock: (variantId, qty, tx) =>
    (tx || prisma).stock.upsert({
      where: { variantId },
      update: { quantity: { increment: qty }, lastUpdated: new Date() },
      create: { variantId, quantity: qty },
    }),
};

module.exports = InventoryRepository;
