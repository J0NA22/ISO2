// src/services/report.service.js
// Generación de reportes de ventas e inventario

const prisma = require('../config/database');

class ReportService {
  /**
   * Reporte de ventas por rango de fechas
   */
  async getSalesReport({ from, to } = {}) {
    const where = { status: 'COMPLETED' };
    if (from || to) {
      where.saleDate = {};
      if (from) where.saleDate.gte = new Date(from);
      if (to) where.saleDate.lte = new Date(to);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { payment: { select: { method: true } } },
    });

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalTax = sales.reduce((sum, s) => sum + Number(s.taxAmount), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discountAmount), 0);

    const byMethod = sales.reduce((acc, s) => {
      const method = s.payment?.method || 'UNKNOWN';
      acc[method] = (acc[method] || 0) + Number(s.total);
      return acc;
    }, {});

    return {
      period: { from, to },
      totalSales: sales.length,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      byPaymentMethod: byMethod,
    };
  }

  /**
   * Productos más vendidos
   */
  async getTopSellingProducts({ limit = 10, from, to } = {}) {
    const where = { sale: { status: 'COMPLETED' } };
    if (from || to) {
      where.sale = { ...where.sale, saleDate: {} };
      if (from) where.sale.saleDate.gte = new Date(from);
      if (to) where.sale.saleDate.lte = new Date(to);
    }

    const details = await prisma.saleDetail.groupBy({
      by: ['variantId'],
      where,
      _sum: { quantity: true, lineSubtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: parseInt(limit),
    });

    // Enriquecer con datos del producto
    const enriched = await Promise.all(
      details.map(async (d) => {
        const variant = await prisma.variant.findUnique({
          where: { id: d.variantId },
          include: { product: true, size: true, color: true },
        });
        return {
          variantId: d.variantId,
          totalQuantity: d._sum.quantity,
          totalRevenue: d._sum.lineSubtotal,
          product: variant?.product?.name,
          sku: variant?.sku,
          size: variant?.size?.name,
          color: variant?.color?.name,
        };
      })
    );

    return enriched;
  }

  /**
   * Reporte de inventario actual
   */
  async getInventoryReport() {
    const stocks = await prisma.stock.findMany({
      include: {
        variant: {
          include: { product: { include: { category: true } }, size: true, color: true },
        },
      },
      orderBy: { quantity: 'asc' },
    });

    const totalItems = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const lowStock = stocks.filter((s) => s.quantity <= s.variant.minThreshold);
    const outOfStock = stocks.filter((s) => s.quantity === 0);

    return {
      totalVariants: stocks.length,
      totalUnits: totalItems,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStock.length,
      items: stocks,
    };
  }

  /**
   * Dashboard: KPIs principales
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todaySales, totalProducts, lowStockCount, recentSales] = await Promise.all([
      prisma.sale.aggregate({
        where: { status: 'COMPLETED', saleDate: { gte: today, lt: tomorrow } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM pos_system.stock s 
        JOIN pos_system.variants v ON s.variant_id = v.id 
        WHERE s.quantity <= v.min_threshold AND v.is_active = true
      `,
      prisma.sale.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { saleDate: 'desc' },
        include: { customer: { select: { fullName: true } } },
      }),
    ]);

    return {
      todayRevenue: Number(todaySales._sum.total || 0),
      todaySalesCount: todaySales._count,
      totalActiveProducts: totalProducts,
      lowStockAlerts: Number(lowStockCount[0]?.count || 0),
      recentSales,
    };
  }
}

module.exports = new ReportService();
