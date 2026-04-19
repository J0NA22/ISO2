// src/services/sale.service.js
// Servicio de ventas — núcleo transaccional del sistema
// Implementa Strategy para descuentos y transacciones ACID de PostgreSQL

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');
const { nextSaleNumber, nextReceiptNumber } = require('../utils/numberGen');

class SaleService {

  // ── CÁLCULO DE TOTALES (Strategy Pattern) ─────────────────

  /**
   * Calcula subtotal, descuento, impuesto y total de una venta.
   * Obtiene la tasa de impuesto activa desde tax_config.
   */
  async calculateTotals(items, discountId = null) {
    // Obtener tasa de impuesto activa
    const taxConfig = await prisma.taxConfig.findFirst({ where: { isActive: true } });
    const taxRate = taxConfig ? Number(taxConfig.rate) : 0.15;

    // Calcular líneas
    let subtotal = 0;
    for (const item of items) {
      const lineSubtotal = (item.unitPrice * item.quantity) - (item.lineDiscount || 0);
      subtotal += lineSubtotal;
    }

    // Calcular descuento global
    let discountAmount = 0;
    let discountData = null;
    if (discountId) {
      discountData = await prisma.discount.findUnique({ where: { id: discountId, isActive: true } });
      if (discountData) {
        if (discountData.type === 'PERCENTAGE') {
          discountAmount = subtotal * (Number(discountData.value) / 100);
        } else {
          discountAmount = Math.min(Number(discountData.value), subtotal);
        }
      }
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      taxRate,
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }

  // ── VALIDAR STOCK ─────────────────────────────────────────

  async validateStock(items) {
    const errors = [];
    for (const item of items) {
      const stock = await prisma.stock.findUnique({ where: { variantId: item.variantId } });
      if (!stock || stock.quantity < item.quantity) {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true, size: true, color: true },
        });
        errors.push({
          variantId: item.variantId,
          sku: variant?.sku,
          available: stock?.quantity ?? 0,
          requested: item.quantity,
          message: `Stock insuficiente para ${variant?.product?.name} (${variant?.size?.name}/${variant?.color?.name})`,
        });
      }
    }
    if (errors.length > 0) {
      const err = new Error('Stock insuficiente para uno o más productos');
      err.statusCode = 409;
      err.details = errors;
      throw err;
    }
  }

  // ── CREAR VENTA ────────────────────────────────────────────

  /**
   * Crea una venta en estado IN_PROGRESS.
   * Endpoint completo con ejemplo de flujo frontend → backend → BD.
   */
  async createSale(data, userId, ipAddress) {
    // 1. Validar stock antes de tocar la BD
    await this.validateStock(data.items);

    // 2. Calcular totales
    const totals = await this.calculateTotals(data.items, data.discountId);

    // 3. Número de venta
    const saleNumber = await nextSaleNumber();

    // 4. Transacción ACID: crear venta + detalles + descontar stock
    const sale = await prisma.$transaction(async (tx) => {
      // Crear cabecera de venta
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: data.customerId || null,
          userId,
          discountId: data.discountId || null,
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          status: 'IN_PROGRESS',
        },
      });

      // Crear líneas de detalle y descontar stock
      for (const item of data.items) {
        const lineSubtotal = (item.unitPrice * item.quantity) - (item.lineDiscount || 0);

        await tx.saleDetail.create({
          data: {
            saleId: newSale.id,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineDiscount: item.lineDiscount || 0,
            lineSubtotal: parseFloat(lineSubtotal.toFixed(2)),
          },
        });

        // Descontar stock — dentro de la transacción
        await tx.stock.update({
          where: { variantId: item.variantId },
          data: {
            quantity: { decrement: item.quantity },
            lastUpdated: new Date(),
          },
        });
      }

      return newSale;
    });

    await auditLog({ userId, action: 'CREATE', entity: 'sale', entityId: sale.id, ipAddress });
    return this.getSaleById(sale.id);
  }

  // ── COMPLETAR VENTA ────────────────────────────────────────

  async completeSale(saleId, paymentData, userId, ipAddress) {
    const sale = await this.getSaleById(saleId);

    if (sale.status !== 'IN_PROGRESS') {
      throw Object.assign(new Error('Solo se puede completar una venta en progreso'), { statusCode: 409 });
    }

    const receiptNumber = await nextReceiptNumber();

    const result = await prisma.$transaction(async (tx) => {
      // Registrar pago
      await tx.payment.create({
        data: {
          saleId,
          method: paymentData.method,
          amountPaid: paymentData.amountPaid,
          changeGiven: paymentData.changeGiven || 0,
          reference: paymentData.reference || null,
        },
      });

      // Actualizar estado de venta
      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'COMPLETED' },
      });

      // Generar comprobante
      const receipt = await tx.receipt.create({
        data: {
          saleId,
          receiptNumber,
          type: 'SALE',
          content: JSON.stringify({ saleId, total: sale.total, method: paymentData.method }),
        },
      });

      return receipt;
    });

    await auditLog({ userId, action: 'UPDATE', entity: 'sale', entityId: saleId, details: { status: 'COMPLETED' }, ipAddress });
    return { sale: await this.getSaleById(saleId), receipt: result };
  }

  // ── CANCELAR VENTA ─────────────────────────────────────────

  async cancelSale(saleId, reason, userId, ipAddress) {
    const sale = await this.getSaleById(saleId);

    if (sale.status === 'CANCELLED') {
      throw Object.assign(new Error('Esta venta ya fue cancelada'), { statusCode: 409 });
    }

    await prisma.$transaction(async (tx) => {
      // Revertir stock
      for (const detail of sale.details) {
        await tx.stock.update({
          where: { variantId: detail.variantId },
          data: {
            quantity: { increment: detail.quantity },
            lastUpdated: new Date(),
          },
        });
      }

      await tx.sale.update({
        where: { id: saleId },
        data: { status: 'CANCELLED', cancellationReason: reason },
      });
    });

    await auditLog({ userId, action: 'CANCEL', entity: 'sale', entityId: saleId, details: { reason }, ipAddress });
    return this.getSaleById(saleId);
  }

  // ── CONSULTAS ──────────────────────────────────────────────

  async getSaleById(id) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
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
      },
    });
    if (!sale) throw Object.assign(new Error('Venta no encontrada'), { statusCode: 404 });
    return sale;
  }

  async listSales({ page = 1, limit = 20, status, userId: filterUserId, customerId, from, to } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (filterUserId) where.userId = parseInt(filterUserId);
    if (customerId) where.customerId = parseInt(customerId);
    if (from || to) {
      where.saleDate = {};
      if (from) where.saleDate.gte = new Date(from);
      if (to) where.saleDate.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where, skip, take: limit,
        orderBy: { saleDate: 'desc' },
        include: {
          customer: { select: { id: true, fullName: true } },
          user: { select: { id: true, fullName: true } },
          payment: { select: { method: true } },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}

module.exports = new SaleService();
