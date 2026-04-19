// src/services/inventory.service.js
// Servicio de inventario — stock, entradas, alertas

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');
const { nextEntryNumber } = require('../utils/numberGen');

class InventoryService {

  // ── STOCK ─────────────────────────────────────────────────

  async getFullInventory({ categoryId, lowStock } = {}) {
    const where = { variant: { isActive: true } };

    if (categoryId) {
      where.variant = { ...where.variant, product: { categoryId: parseInt(categoryId) } };
    }

    if (lowStock === 'true') {
      // Variantes donde quantity < min_threshold
      where.AND = [
        { quantity: { gt: 0 } },
      ];
    }

    const stocks = await prisma.stock.findMany({
      where,
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
    });

    return stocks;
  }

  async getLowStockAlerts() {
    // Retorna variantes cuyo stock está en o por debajo del umbral mínimo
    const alerts = await prisma.$queryRaw`
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
    `;
    return alerts;
  }

  // ── ENTRADAS DE INVENTARIO ─────────────────────────────────

  async registerEntry(data, userId, ipAddress) {
    const entryNumber = await nextEntryNumber();

    // Calcular costo total
    let totalCost = 0;
    for (const d of data.details) {
      totalCost += d.quantity * d.unitCost;
    }

    const entry = await prisma.$transaction(async (tx) => {
      // Crear cabecera
      const newEntry = await tx.inventoryEntry.create({
        data: {
          entryNumber,
          supplierId: data.supplierId,
          userId,
          notes: data.notes || null,
          totalCost: parseFloat(totalCost.toFixed(2)),
        },
      });

      // Crear detalles e incrementar stock
      for (const detail of data.details) {
        await tx.entryDetail.create({
          data: {
            entryId: newEntry.id,
            variantId: detail.variantId,
            quantity: detail.quantity,
            unitCost: detail.unitCost,
          },
        });

        // Incrementar stock
        await tx.stock.upsert({
          where: { variantId: detail.variantId },
          update: {
            quantity: { increment: detail.quantity },
            lastUpdated: new Date(),
          },
          create: {
            variantId: detail.variantId,
            quantity: detail.quantity,
          },
        });
      }

      return newEntry;
    });

    await auditLog({ userId, action: 'CREATE', entity: 'inventory_entry', entityId: entry.id, ipAddress });
    return this.getEntryById(entry.id);
  }

  async getEntryById(id) {
    const entry = await prisma.inventoryEntry.findUnique({
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
    });
    if (!entry) throw Object.assign(new Error('Entrada no encontrada'), { statusCode: 404 });
    return entry;
  }

  async listEntries({ page = 1, limit = 20, supplierId } = {}) {
    const skip = (page - 1) * limit;
    const where = supplierId ? { supplierId: parseInt(supplierId) } : {};

    const [data, total] = await Promise.all([
      prisma.inventoryEntry.findMany({
        where, skip, take: limit,
        orderBy: { entryDate: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          user: { select: { id: true, fullName: true } },
        },
      }),
      prisma.inventoryEntry.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

module.exports = new InventoryService();
