// src/services/cashClosing.service.js
// Servicio de cierre de caja — Responsabilidad Única (SOLID-S)
// Consolida totales de ventas del turno y registra diferencias de caja

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');

class CashClosingService {
  /**
   * Registra el cierre de caja del turno actual.
   * Suma ventas por método de pago en el rango de tiempo dado.
   */
  async closeCash(data, userId, ipAddress) {
    const { openingDate, countedAmount, initialAmount = 0, notes } = data;

    const from = new Date(openingDate);
    const to = new Date();

    // Obtener todas las ventas completadas en el período
    const sales = await prisma.sale.findMany({
      where: {
        status: 'COMPLETED',
        saleDate: { gte: from, lte: to },
      },
      include: { payment: { select: { method: true, amountPaid: true } } },
    });

    const cancelledSales = await prisma.sale.findMany({
      where: {
        status: 'CANCELLED',
        saleDate: { gte: from, lte: to },
      },
      include: { payment: { select: { method: true, amountPaid: true } } },
    });

    // Calcular totales por método
    let totalCashSales = 0;
    let totalCardSales = 0;
    let totalTransferSales = 0;

    for (const sale of sales) {
      const method = sale.payment?.method;
      const amount = Number(sale.total);
      if (method === 'CASH') totalCashSales += amount;
      else if (method === 'CARD') totalCardSales += amount;
      else if (method === 'TRANSFER') totalTransferSales += amount;
      else if (method === 'MIXED') {
        // Para MIXED, se suma al efectivo (simplificación)
        totalCashSales += amount;
      }
    }

    const totalCancellations = cancelledSales.reduce(
      (sum, s) => sum + (s.payment ? Number(s.payment.amountPaid) : 0), 0
    );

    const expectedCash = Number(initialAmount) + totalCashSales - totalCancellations;
    const difference = Number(countedAmount) - expectedCash;

    const closing = await prisma.cashClosing.create({
      data: {
        userId,
        openingDate: from,
        closingDate: to,
        initialAmount: Number(initialAmount),
        totalCashSales: parseFloat(totalCashSales.toFixed(2)),
        totalCardSales: parseFloat(totalCardSales.toFixed(2)),
        totalTransferSales: parseFloat(totalTransferSales.toFixed(2)),
        totalCancellations: parseFloat(totalCancellations.toFixed(2)),
        expectedCash: parseFloat(expectedCash.toFixed(2)),
        countedAmount: Number(countedAmount),
        difference: parseFloat(difference.toFixed(2)),
        notes: notes || null,
      },
      include: { user: { select: { id: true, fullName: true } } },
    });

    await auditLog({
      userId,
      action: 'CREATE',
      entity: 'cash_closing',
      entityId: closing.id,
      details: { difference: closing.difference },
      ipAddress,
    });

    return closing;
  }

  /**
   * Lista todos los cierres de caja con paginación
   */
  async listClosings({ page = 1, limit = 20, userId: filterUserId } = {}) {
    const skip = (page - 1) * limit;
    const where = filterUserId ? { userId: parseInt(filterUserId) } : {};

    const [data, total] = await Promise.all([
      prisma.cashClosing.findMany({
        where, skip, take: limit,
        orderBy: { closingDate: 'desc' },
        include: { user: { select: { id: true, fullName: true } } },
      }),
      prisma.cashClosing.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  /**
   * Obtiene un cierre de caja por ID
   */
  async getById(id) {
    const closing = await prisma.cashClosing.findUnique({
      where: { id },
      include: { user: { select: { id: true, fullName: true } } },
    });
    if (!closing) throw Object.assign(new Error('Cierre de caja no encontrado'), { statusCode: 404 });
    return closing;
  }
}

module.exports = new CashClosingService();
