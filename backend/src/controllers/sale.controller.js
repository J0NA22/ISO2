// src/controllers/sale.controller.js
// Controlador de ventas — endpoint más crítico del sistema

const saleService = require('../services/sale.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId, customerId, from, to } = req.query;
    const result = await saleService.listSales({
      page: parseInt(page), limit: parseInt(limit), status, userId, customerId, from, to,
    });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const sale = await saleService.getSaleById(parseInt(req.params.id));
    return sendSuccess(res, sale);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const sale = await saleService.createSale(req.body, req.user.id, req.ip);
    return sendSuccess(res, sale, 201, 'Venta creada');
  } catch (err) { next(err); }
};

const complete = async (req, res, next) => {
  try {
    const result = await saleService.completeSale(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, result, 200, 'Venta completada');
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const sale = await saleService.cancelSale(parseInt(req.params.id), req.body.cancellationReason, req.user.id, req.ip);
    return sendSuccess(res, sale, 200, 'Venta cancelada');
  } catch (err) { next(err); }
};

const calculateTotals = async (req, res, next) => {
  try {
    const { items, discountId } = req.body;
    const totals = await saleService.calculateTotals(items, discountId);
    return sendSuccess(res, totals);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, complete, cancel, calculateTotals };
