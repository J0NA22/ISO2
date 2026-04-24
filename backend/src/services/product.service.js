// src/services/product.service.js
// Servicio de productos — Responsabilidad Única (SOLID-S)
// Solo maneja catálogo: productos, variantes, categorías, tallas, colores

const prisma = require('../config/database');
const { auditLog } = require('../utils/auditLogger');

class ProductService {
  // ── PRODUCTOS ──────────────────────────────────────────────

  async listProducts({ page = 1, limit = 20, status, categoryId, search } = {}) {
    const skip = (page - 1) * limit;
    const where = {};

    if (status) where.status = status;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          category: { select: { id: true, name: true } },
          variants: {
            where: { isActive: true },
            include: {
              size: true,
              color: true,
              stock: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          include: { size: true, color: true, stock: true },
          orderBy: [{ size: { sortOrder: 'asc' } }, { color: { name: 'asc' } }],
        },
        suppliers: { include: { supplier: true } },
      },
    });

    if (!product) throw Object.assign(new Error('Producto no encontrado'), { statusCode: 404 });
    return product;
  }

  async searchByBarcode(barcode) {
    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        variants: { include: { size: true, color: true, stock: true } },
      },
    });
    if (!product) throw Object.assign(new Error('Producto no encontrado'), { statusCode: 404 });
    return product;
  }

  async createProduct(data, userId, ipAddress) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        barcode: data.barcode,
        basePrice: data.basePrice,
        status: data.status || 'ACTIVE',
      },
      include: { category: true },
    });

    await auditLog({ userId, action: 'CREATE', entity: 'product', entityId: product.id, ipAddress });
    return product;
  }

  async updateProduct(id, data, userId, ipAddress) {
    const before = await this.getProductById(id);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.barcode !== undefined && { barcode: data.barcode }),
        ...(data.basePrice && { basePrice: data.basePrice }),
        ...(data.status && { status: data.status }),
      },
    });

    await auditLog({
      userId, action: 'UPDATE', entity: 'product', entityId: id,
      details: { before, after: data }, ipAddress,
    });

    return updated;
  }

  async deleteProduct(id, userId, ipAddress) {
    // Eliminación lógica — nunca se pierde (regla de negocio del diseño)
    await this.getProductById(id); // Verifica que existe
    const updated = await prisma.product.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    await auditLog({ userId, action: 'DELETE', entity: 'product', entityId: id, ipAddress });
    return updated;
  }

  // ── VARIANTES ──────────────────────────────────────────────

  async createVariant(productId, data, userId, ipAddress) {
    await this.getProductById(productId); // Verifica que el producto existe

    const variant = await prisma.$transaction(async (tx) => {
      const v = await tx.variant.create({
        data: {
          productId,
          sizeId: data.sizeId,
          colorId: data.colorId,
          sku: data.sku,
          specificPrice: data.specificPrice,
          minThreshold: data.minThreshold ?? 5,
          isActive: data.isActive ?? true,
        },
        include: { size: true, color: true },
      });

      // Crear registro de stock inicial (0 unidades)
      await tx.stock.create({ data: { variantId: v.id, quantity: 0 } });
      return v;
    });

    await auditLog({ userId, action: 'CREATE', entity: 'variant', entityId: variant.id, ipAddress });
    return variant;
  }

  // ── CATÁLOGOS ──────────────────────────────────────────────

  async listCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data) {
    return prisma.category.create({
      data: { name: data.name.trim(), description: data.description, isActive: data.isActive ?? true },
    });
  }

  async updateCategory(id, data) {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async listSizes() {
    return prisma.size.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createSize(data) {
    return prisma.size.create({
      data: { name: data.name.trim(), sortOrder: data.sortOrder ?? 0 },
    });
  }

  async updateSize(id, data) {
    return prisma.size.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });
  }

  async listColors() {
    return prisma.color.findMany({ orderBy: { name: 'asc' } });
  }

  async createColor(data) {
    return prisma.color.create({
      data: { name: data.name.trim(), hexCode: data.hexCode ?? '#000000' },
    });
  }

  async updateColor(id, data) {
    return prisma.color.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.hexCode && { hexCode: data.hexCode }),
      },
    });
  }
}

module.exports = new ProductService();
