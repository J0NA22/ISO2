// src/services/user.service.js
// Gestión de usuarios del sistema — con hashing de contraseñas

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { bcryptRounds } = require('../config/auth');
const { auditLog } = require('../utils/auditLogger');

class UserService {
  async listUsers({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip, take: limit,
        orderBy: { fullName: 'asc' },
        select: {
          id: true, fullName: true, username: true, status: true,
          createdAt: true, lastLogin: true,
          role: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, username: true, status: true,
        createdAt: true, lastLogin: true,
        role: { select: { id: true, name: true, permissions: true } },
      },
    });
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });
    return user;
  }

  async createUser(data, actorId, ipAddress) {
    // Hash de contraseña — nunca almacenar en texto plano
    const passwordHash = await bcrypt.hash(data.password, bcryptRounds);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        username: data.username,
        passwordHash,
        roleId: data.roleId,
        status: data.status || 'ACTIVE',
      },
      select: { id: true, fullName: true, username: true, status: true },
    });

    await auditLog({ userId: actorId, action: 'CREATE', entity: 'user', entityId: user.id, ipAddress });
    return user;
  }

  async updateUser(id, data, actorId, ipAddress) {
    await this.getUserById(id);
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.roleId && { roleId: data.roleId }),
        ...(data.status && { status: data.status }),
      },
      select: { id: true, fullName: true, username: true, status: true },
    });
    await auditLog({ userId: actorId, action: 'UPDATE', entity: 'user', entityId: id, ipAddress });
    return updated;
  }

  async changePassword(id, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { statusCode: 404 });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw Object.assign(new Error('Contraseña actual incorrecta'), { statusCode: 401 });

    const newHash = await bcrypt.hash(newPassword, bcryptRounds);
    await prisma.user.update({ where: { id }, data: { passwordHash: newHash } });
    return { message: 'Contraseña actualizada correctamente' };
  }

  async listRoles() {
    return prisma.role.findMany({ orderBy: { name: 'asc' } });
  }
}

module.exports = new UserService();
