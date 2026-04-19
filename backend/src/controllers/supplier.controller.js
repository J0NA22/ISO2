// src/controllers/supplier.controller.js

const supplierService = require('../services/supplier.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await supplierService.listSuppliers({ page: parseInt(page), limit: parseInt(limit), search });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const s = await supplierService.getSupplierById(parseInt(req.params.id));
    return sendSuccess(res, s);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const s = await supplierService.createSupplier(req.body);
    return sendSuccess(res, s, 201, 'Proveedor creado');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const s = await supplierService.updateSupplier(parseInt(req.params.id), req.body);
    return sendSuccess(res, s);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await supplierService.deleteSupplier(parseInt(req.params.id));
    return sendSuccess(res, null, 200, 'Proveedor desactivado');
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove };
