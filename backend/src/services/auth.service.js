// src/services/auth.service.js
// Servicio de autenticación — Responsabilidad Única (SOLID-S)
// Maneja login, generación de tokens y actualización de último acceso

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const { auditLog } = require('../utils/auditLogger');

class AuthService {
  /**
   * Autentica al usuario y retorna un JWT.
   * Usa tiempo constante en comparación de contraseñas para prevenir timing attacks.
   */
  async login(username, password, ipAddress) {
    // 1. Buscar usuario (incluye permisos del rol)
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: { select: { name: true, permissions: true } } },
    });

    // 2. Verificar que existe y está activo
    // Usamos bcrypt.compare incluso si no existe (tiempo constante)
    const dummyHash = '$2a$12$dummy.hash.for.timing.attack.prevention.only';
    const passwordToCheck = user ? user.passwordHash : dummyHash;
    const isValid = await bcrypt.compare(password, passwordToCheck);

    if (!user || !isValid || user.status !== 'ACTIVE') {
      // Mismo mensaje para usuario no encontrado y contraseña incorrecta
      throw Object.assign(new Error('Credenciales inválidas'), { statusCode: 401 });
    }

    // 3. Generar JWT con payload mínimo necesario
    const payload = {
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      role: user.role.name,
      permissions: user.role.permissions,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // 4. Actualizar último login (no bloqueante)
    prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(() => {}); // No bloquear si falla

    // 5. Registrar en auditoría
    await auditLog({
      userId: user.id,
      action: 'LOGIN',
      entity: 'user',
      entityId: user.id,
      ipAddress,
    });

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        role: user.role.name,
        permissions: user.role.permissions,
      },
    };
  }

  /**
   * Registra el logout en auditoría
   */
  async logout(userId, ipAddress) {
    await auditLog({
      userId,
      action: 'LOGOUT',
      entity: 'user',
      entityId: userId,
      ipAddress,
    });
  }
}

module.exports = new AuthService();
