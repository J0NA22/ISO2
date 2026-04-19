// src/utils/numberGen.js
// Generador de números secuenciales para ventas y entradas

const prisma = require('../config/database');

/**
 * Genera el siguiente número de venta: VTA-00001
 */
async function nextSaleNumber() {
  const last = await prisma.sale.findFirst({ orderBy: { id: 'desc' } });
  const next = last ? last.id + 1 : 1;
  return `VTA-${String(next).padStart(5, '0')}`;
}

/**
 * Genera el siguiente número de entrada: ENT-00001
 */
async function nextEntryNumber() {
  const last = await prisma.inventoryEntry.findFirst({ orderBy: { id: 'desc' } });
  const next = last ? last.id + 1 : 1;
  return `ENT-${String(next).padStart(5, '0')}`;
}

/**
 * Genera el siguiente número de comprobante: REC-00001
 */
async function nextReceiptNumber() {
  const last = await prisma.receipt.findFirst({ orderBy: { id: 'desc' } });
  const next = last ? last.id + 1 : 1;
  return `REC-${String(next).padStart(5, '0')}`;
}

module.exports = { nextSaleNumber, nextEntryNumber, nextReceiptNumber };
