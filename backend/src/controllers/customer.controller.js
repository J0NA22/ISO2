// src/controllers/customer.controller.js

const customerService = require('../services/customer.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await customerService.listCustomers({ page: parseInt(page), limit: parseInt(limit), search });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(parseInt(req.params.id));
    return sendSuccess(res, customer);
  } catch (err) { next(err); }
};

const getPurchaseHistory = async (req, res, next) => {
  try {
    const history = await customerService.getPurchaseHistory(parseInt(req.params.id));
    return sendSuccess(res, history);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, customer, 201, 'Cliente creado');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(parseInt(req.params.id), req.body);
    return sendSuccess(res, customer);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(parseInt(req.params.id));
    return sendSuccess(res, null, 200, 'Cliente desactivado');
  } catch (err) { next(err); }
};

module.exports = { list, getById, getPurchaseHistory, create, update, remove };
