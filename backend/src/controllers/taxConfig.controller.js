// src/controllers/taxConfig.controller.js

const taxConfigService = require('../services/taxConfig.service');
const { sendSuccess } = require('../utils/response');

const getActive = async (req, res, next) => {
  try {
    const data = await taxConfigService.getActiveTax();
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const listAll = async (req, res, next) => {
  try {
    const data = await taxConfigService.listAll();
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const data = await taxConfigService.createTax(req.body, req.user.id, req.ip);
    return sendSuccess(res, data, 201, 'Configuración de impuesto creada');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await taxConfigService.updateTax(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

module.exports = { getActive, listAll, create, update };
