// src/controllers/auth.controller.js
// Controlador de autenticación — solo maneja HTTP (req/res)
// La lógica de negocio está en AuthService (SOLID-S)

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.login(username, password, ipAddress);
    return sendSuccess(res, result, 200, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    await authService.logout(req.user.id, ipAddress);
    return sendSuccess(res, null, 200, 'Sesión cerrada');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    // req.user viene del JWT ya decodificado — sin consulta a BD
    return sendSuccess(res, req.user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, me };
