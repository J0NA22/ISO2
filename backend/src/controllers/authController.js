// Controlador de autenticación (RF22) - Solo maneja HTTP
const authService = require('../services/authService');

class AuthController {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req, res, next) {
    try {
      const userService = require('../services/userService');
      const user = await userService.getById(req.user.id);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
