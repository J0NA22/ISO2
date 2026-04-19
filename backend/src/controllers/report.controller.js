// src/controllers/report.controller.js

const reportService = require('../services/report.service');
const { sendSuccess } = require('../utils/response');

const dashboard = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    return sendSuccess(res, stats);
  } catch (err) { next(err); }
};

const salesReport = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const report = await reportService.getSalesReport({ from, to });
    return sendSuccess(res, report);
  } catch (err) { next(err); }
};

const topProducts = async (req, res, next) => {
  try {
    const { limit = 10, from, to } = req.query;
    const report = await reportService.getTopSellingProducts({ limit, from, to });
    return sendSuccess(res, report);
  } catch (err) { next(err); }
};

const inventoryReport = async (req, res, next) => {
  try {
    const report = await reportService.getInventoryReport();
    return sendSuccess(res, report);
  } catch (err) { next(err); }
};

module.exports = { dashboard, salesReport, topProducts, inventoryReport };
