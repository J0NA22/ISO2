// src/controllers/cashClosing.controller.js
// Controlador de cierre de caja

const cashClosingService = require('../services/cashClosing.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId } = req.query;
    const result = await cashClosingService.listClosings({
      page: parseInt(page),
      limit: parseInt(limit),
      userId,
    });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const closing = await cashClosingService.getById(parseInt(req.params.id));
    return sendSuccess(res, closing);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const closing = await cashClosingService.closeCash(req.body, req.user.id, req.ip);
    return sendSuccess(res, closing, 201, 'Cierre de caja registrado');
  } catch (err) { next(err); }
};

module.exports = { list, getById, create };
