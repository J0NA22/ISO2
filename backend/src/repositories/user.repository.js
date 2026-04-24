// src/repositories/user.repository.js
// Acceso a datos para usuarios y roles

const prisma = require('../config/database');

const userSelect = {
  id: true, fullName: true, username: true,
  status: true, createdAt: true, lastLogin: true,
  role: { select: { id: true, name: true } },
};

const UserRepository = {
  findMany: ({ skip = 0, take = 20 } = {}) =>
    prisma.user.findMany({
      skip, take,
      orderBy: { fullName: 'asc' },
      select: userSelect,
    }),

  count: () => prisma.user.count(),

  findById: (id) =>
    prisma.user.findUnique({
      where: { id },
      select: { ...userSelect, role: { select: { id: true, name: true, permissions: true } } },
    }),

  findByUsername: (username) =>
    prisma.user.findUnique({
      where: { username },
      include: { role: { select: { name: true, permissions: true } } },
    }),

  findByIdWithHash: (id) =>
    prisma.user.findUnique({ where: { id } }),

  create: (data) =>
    prisma.user.create({
      data,
      select: { id: true, fullName: true, username: true, status: true },
    }),

  update: (id, data) =>
    prisma.user.update({
      where: { id },
      data,
      select: { id: true, fullName: true, username: true, status: true },
    }),

  updatePasswordHash: (id, passwordHash) =>
    prisma.user.update({ where: { id }, data: { passwordHash } }),

  updateLastLogin: (id) =>
    prisma.user.update({ where: { id }, data: { lastLogin: new Date() } }),

  findRoles: () => prisma.role.findMany({ orderBy: { name: 'asc' } }),
};

module.exports = UserRepository;
