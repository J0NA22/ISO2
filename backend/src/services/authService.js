// Servicio de autenticación (RF22) - Lógica de login y JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');
const AppError = require('../utils/AppError');

class AuthService {
  // Iniciar sesión
  async login(username, password) {
    // Buscar usuario
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    // Verificar si el usuario está activo
    if (!user.is_active) {
      throw AppError.unauthorized('Cuenta desactivada. Contacte al administrador.');
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw AppError.unauthorized('Credenciales incorrectas');
    }

    // Generar token JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role_name,
        roleId: user.role_id,
      },
    };
  }

  // Registrar nuevo usuario (solo admin)
  async register(userData) {
    // Verificar si el username ya existe
    const existing = await userRepository.findByUsername(userData.username);
    if (existing) {
      throw AppError.conflict('El nombre de usuario ya está en uso');
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Crear usuario
    const user = await userRepository.create({
      ...userData,
      password_hash: passwordHash,
    });

    return user;
  }

  // Generar token JWT
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role_name,
        roleId: user.role_id,
      },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
  }
}

module.exports = new AuthService();
