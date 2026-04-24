// src/controllers/discount.controller.js

const discountService = require('../services/discount.service');
const { sendSuccess } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { active } = req.query;
    const data = await discountService.listDiscounts({ active });
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const data = await discountService.getById(parseInt(req.params.id));
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await discountService.createDiscount(req.body, req.user.id, req.ip);
    return sendSuccess(res, data, 201, 'Descuento creado');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await discountService.updateDiscount(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await discountService.deleteDiscount(parseInt(req.params.id), req.user.id, req.ip);
    return sendSuccess(res, null, 200, 'Descuento desactivado');
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, remove };
