// src/controllers/user.controller.js

const userService = require('../services/user.service');
const { sendSuccess, sendPaginated } = require('../utils/response');

const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await userService.listUsers({ page: parseInt(page), limit: parseInt(limit) });
    return sendPaginated(res, result.data, result.meta);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id));
    return sendSuccess(res, user);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user.id, req.ip);
    return sendSuccess(res, user, 201, 'Usuario creado');
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(parseInt(req.params.id), req.body, req.user.id, req.ip);
    return sendSuccess(res, user);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await userService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
};

const listRoles = async (req, res, next) => {
  try {
    const roles = await userService.listRoles();
    return sendSuccess(res, roles);
  } catch (err) { next(err); }
};

module.exports = { list, getById, create, update, changePassword, listRoles };
