// src/controllers/inventory.controller.js

const inventoryService = require('../services/inventory.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const getFullInventory = async (req, res, next) => {
  try {
    const data = await inventoryService.getFullInventory(req.query);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getLowStockAlerts = async (req, res, next) => {
  try {
    const alerts = await inventoryService.getLowStockAlerts();
    return sendSuccess(res, alerts);
  } catch (err) { next(err); }
};

const registerEntry = async (req, res, next) => {
  try {
    const entry = await inventoryService.registerEntry(req.body, req.user.id, req.ip);
    return sendSuccess(res, entry, 201, 'Entrada de inventario registrada');
  } catch (err) { next(err); }
};

const listEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, supplierId } = req.query;
    const result = await inventoryService.listEntries({ page: parseInt(page), limit: parseInt(limit), supplierId });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getEntryById = async (req, res, next) => {
  try {
    const entry = await inventoryService.getEntryById(parseInt(req.params.id));
    return sendSuccess(res, entry);
  } catch (err) { next(err); }
};

module.exports = { getFullInventory, getLowStockAlerts, registerEntry, listEntries, getEntryById };
