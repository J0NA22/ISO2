// Repositorio de productos - Acceso a datos (SRP + DIP)
const { query, getClient } = require('../config/database');

class ProductRepository {
  // Obtener todos los productos activos con info del proveedor
  async findAll(filters = {}) {
    let sql = `
      SELECT p.*, pr.company_name as provider_name,
        (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id AND pv.is_active = true) as variant_count,
        (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id) as total_stock
      FROM products p
      LEFT JOIN providers pr ON p.provider_id = pr.id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      sql += ` AND p.category = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.search) {
      paramCount++;
      sql += ` AND (p.name ILIKE $${paramCount} OR p.barcode ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY p.name ASC';

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      paramCount++;
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Obtener producto por ID con variantes
  async findById(id) {
    const productResult = await query(
      `SELECT p.*, pr.company_name as provider_name
       FROM products p
       LEFT JOIN providers pr ON p.provider_id = pr.id
       WHERE p.id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) return null;

    const variantsResult = await query(
      `SELECT * FROM product_variants WHERE product_id = $1 AND is_active = true ORDER BY size, color`,
      [id]
    );

    return {
      ...productResult.rows[0],
      variants: variantsResult.rows,
    };
  }

  // Buscar producto por código de barras
  async findByBarcode(barcode) {
    const result = await query(
      `SELECT p.*, pv.id as variant_id, pv.size, pv.color, pv.stock, pv.sku
       FROM products p
       JOIN product_variants pv ON p.id = pv.product_id
       WHERE (p.barcode = $1 OR pv.barcode = $1) AND p.is_active = true AND pv.is_active = true`,
      [barcode]
    );
    return result.rows[0] || null;
  }

  // Crear producto
  async create(productData) {
    const { name, description, category, barcode, base_price, sale_price, provider_id } = productData;
    const result = await query(
      `INSERT INTO products (name, description, category, barcode, base_price, sale_price, provider_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, description, category, barcode, base_price, sale_price, provider_id]
    );
    return result.rows[0];
  }

  // Actualizar producto
  async update(id, productData) {
    const { name, description, category, barcode, base_price, sale_price, provider_id } = productData;
    const result = await query(
      `UPDATE products SET name=$1, description=$2, category=$3, barcode=$4,
       base_price=$5, sale_price=$6, provider_id=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [name, description, category, barcode, base_price, sale_price, provider_id, id]
    );
    return result.rows[0];
  }

  // Soft delete de producto
  async delete(id) {
    const result = await query(
      `UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Obtener categorías únicas
  async getCategories() {
    const result = await query(
      `SELECT DISTINCT category FROM products WHERE is_active = true AND category IS NOT NULL ORDER BY category`
    );
    return result.rows.map((r) => r.category);
  }
}

module.exports = new ProductRepository();
