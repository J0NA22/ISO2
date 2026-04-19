// prisma/seed.js
// Datos iniciales: roles, usuario admin y catálogos base
// Ejecutar con: node prisma/seed.js

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ── ROLES ───────────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
      permissions: {
        'sales.create': true,
        'sales.cancel': true,
        'products.create': true,
        'products.update': true,
        'products.delete': true,
        'inventory.create': true,
        'reports.view': true,
        'users.manage': true,
      },
    },
  });

  const vendorRole = await prisma.role.upsert({
    where: { name: 'Vendedor' },
    update: {},
    create: {
      name: 'Vendedor',
      description: 'Puede realizar ventas y consultar inventario',
      permissions: {
        'sales.create': true,
        'sales.cancel': false,
        'products.create': false,
        'products.update': false,
        'products.delete': false,
        'inventory.create': false,
        'reports.view': true,
        'users.manage': false,
      },
    },
  });

  const inventoryRole = await prisma.role.upsert({
    where: { name: 'Inventarista' },
    update: {},
    create: {
      name: 'Inventarista',
      description: 'Puede gestionar inventario y productos',
      permissions: {
        'sales.create': false,
        'sales.cancel': false,
        'products.create': true,
        'products.update': true,
        'products.delete': false,
        'inventory.create': true,
        'reports.view': true,
        'users.manage': false,
      },
    },
  });

  console.log('✅ Roles creados');

  // ── USUARIO ADMINISTRADOR ────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      fullName: 'Administrador del Sistema',
      username: 'admin',
      passwordHash,
      roleId: adminRole.id,
      status: 'ACTIVE',
    },
  });

  // Vendedor de prueba
  const vendorHash = await bcrypt.hash('Vendor123!', 12);
  await prisma.user.upsert({
    where: { username: 'vendedor1' },
    update: {},
    create: {
      fullName: 'María Pérez',
      username: 'vendedor1',
      passwordHash: vendorHash,
      roleId: vendorRole.id,
      status: 'ACTIVE',
    },
  });

  console.log('✅ Usuarios creados (admin / Admin123!)');

  // ── CATEGORÍAS ───────────────────────────────────────────────
  const categories = ['Camisas', 'Pantalones', 'Vestidos', 'Faldas', 'Chaquetas', 'Accesorios'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
  }
  console.log('✅ Categorías creadas');

  // ── TALLAS ───────────────────────────────────────────────────
  const sizes = [
    { name: 'XS', sortOrder: 1 },
    { name: 'S', sortOrder: 2 },
    { name: 'M', sortOrder: 3 },
    { name: 'L', sortOrder: 4 },
    { name: 'XL', sortOrder: 5 },
    { name: 'XXL', sortOrder: 6 },
    { name: 'ÚNICA', sortOrder: 7 },
  ];
  for (const s of sizes) {
    await prisma.size.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }
  console.log('✅ Tallas creadas');

  // ── COLORES ───────────────────────────────────────────────────
  const colors = [
    { name: 'Negro', hexCode: '#1A1A1A' },
    { name: 'Blanco', hexCode: '#FFFFFF' },
    { name: 'Azul', hexCode: '#2563EB' },
    { name: 'Rojo', hexCode: '#DC2626' },
    { name: 'Verde', hexCode: '#16A34A' },
    { name: 'Gris', hexCode: '#6B7280' },
    { name: 'Rosa', hexCode: '#EC4899' },
    { name: 'Amarillo', hexCode: '#EAB308' },
    { name: 'Naranja', hexCode: '#F97316' },
    { name: 'Morado', hexCode: '#7C3AED' },
  ];
  for (const c of colors) {
    await prisma.color.upsert({
      where: { name: c.name },
      update: {},
      create: { name: c.name, hexCode: c.hexCode },
    });
  }
  console.log('✅ Colores creados');

  // ── CONFIGURACIÓN DE IMPUESTOS ──────────────────────────────
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } });
  await prisma.taxConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'IVA',
      rate: 0.15,
      isActive: true,
      updatedBy: adminUser.id,
    },
  });
  console.log('✅ Configuración de impuestos (IVA 15%) creada');

  // ── PROVEEDOR Y PRODUCTO DE EJEMPLO ─────────────────────────
  const supplier = await prisma.supplier.create({
    data: {
      name: 'Textiles del Pacífico S.A.',
      contactPerson: 'Roberto Gómez',
      phone: '+505 2234-5678',
      email: 'ventas@textilespac.com',
      address: 'Managua, Nicaragua',
    },
  }).catch(() => null); // Ignorar si ya existe

  if (supplier) {
    const category = await prisma.category.findFirst({ where: { name: 'Camisas' } });
    const size = await prisma.size.findFirst({ where: { name: 'M' } });
    const color = await prisma.color.findFirst({ where: { name: 'Azul' } });

    const product = await prisma.product.create({
      data: {
        name: 'Camisa Polo Clásica',
        description: 'Camisa polo de algodón premium',
        categoryId: category.id,
        basePrice: 350.00,
        status: 'ACTIVE',
        suppliers: { create: { supplierId: supplier.id } },
      },
    });

    const variant = await prisma.variant.create({
      data: {
        productId: product.id,
        sizeId: size.id,
        colorId: color.id,
        sku: 'POLO-M-AZL',
        minThreshold: 5,
        isActive: true,
      },
    });

    await prisma.stock.create({
      data: { variantId: variant.id, quantity: 50 },
    });

    console.log('✅ Producto y proveedor de ejemplo creados');
  }

  // ── CLIENTES DE EJEMPLO ───────────────────────────────────────
  const sampleCustomers = [
    { fullName: 'María López', phone: '+505 8888-1234', email: 'maria.lopez@email.com' },
    { fullName: 'Juan Martínez', phone: '+505 7777-5678' },
    { fullName: 'Ana García', phone: '+505 9999-4321', email: 'ana.garcia@email.com' },
  ];

  for (const c of sampleCustomers) {
    await prisma.customer.create({ data: c }).catch(() => {});
  }
  console.log('✅ Clientes de ejemplo creados');

  console.log('\n🎉 Seed completado. Credenciales de acceso:');
  console.log('   Admin: admin / Admin123!');
  console.log('   Vendedor: vendedor1 / Vendor123!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
