// Controlador de usuarios (RF21)
const userService = require('../services/userService');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAll();
      res.json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(parseInt(req.params.id));
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(parseInt(req.params.id), req.body);
      res.json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await userService.changePassword(parseInt(req.params.id), req.body.password);
      res.json({ status: 'success', message: 'Contraseña actualizada' });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await userService.delete(parseInt(req.params.id));
      res.json({ status: 'success', message: 'Usuario desactivado' });
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req, res, next) {
    try {
      const roles = await userService.getRoles();
      res.json({ status: 'success', data: roles });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
