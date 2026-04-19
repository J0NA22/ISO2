// src/config/database.js
// Singleton del cliente Prisma — Inversión de Dependencias (SOLID-D)
// Un solo punto de acceso a la BD en toda la aplicación

const { PrismaClient } = require('@prisma/client');

// Previene múltiples instancias en desarrollo con hot reload
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
