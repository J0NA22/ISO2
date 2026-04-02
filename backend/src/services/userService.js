// Servicio de usuarios (RF21)
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

class UserService {
  async getAll() {
    return await userRepository.findAll();
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('Usuario no encontrado');
    return user;
  }

  async update(id, data) {
    const existing = await userRepository.findById(id);
    if (!existing) throw AppError.notFound('Usuario no encontrado');
    return await userRepository.update(id, data);
  }

  async changePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await userRepository.updatePassword(id, hash);
  }

  async delete(id) {
    return await userRepository.delete(id);
  }

  async getRoles() {
    return await userRepository.findAllRoles();
  }
}

module.exports = new UserService();
