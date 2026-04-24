// src/repositories/customer.repository.js
// Acceso a datos para clientes

const prisma = require('../config/database');

const CustomerRepository = {
  findMany: ({ where = {}, skip = 0, take = 20 } = {}) =>
    prisma.customer.findMany({
      where, skip, take,
      orderBy: { fullName: 'asc' },
    }),

  count: (where = {}) => prisma.customer.count({ where }),

  findById: (id) => prisma.customer.findUnique({ where: { id } }),

  findByEmail: (email) => prisma.customer.findUnique({ where: { email } }),

  create: (data) => prisma.customer.create({ data }),

  update: (id, data) => prisma.customer.update({ where: { id }, data }),

  findPurchaseHistory: (customerId, { skip = 0, take = 20 } = {}) =>
    prisma.sale.findMany({
      where: { customerId, status: 'COMPLETED' },
      skip, take,
      orderBy: { saleDate: 'desc' },
      include: {
        payment: { select: { method: true } },
        details: { include: { variant: { include: { product: true } } } },
      },
    }),
};

module.exports = CustomerRepository;
