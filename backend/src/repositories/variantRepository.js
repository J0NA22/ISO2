// Repositorio de variantes de producto (RF13, RF14, RF15)
const { query } = require('../config/database');

class VariantRepository {
  // Obtener variantes por producto
  async findByProductId(productId) {
    const result = await query(
      `SELECT pv.*, p.name as product_name, p.sale_price
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.product_id = $1 AND pv.is_active = true
       ORDER BY pv.size, pv.color`,
      [productId]
    );
    return result.rows;
  }

  // Obtener variante por ID
  async findById(id) {
    const result = await query(
      `SELECT pv.*, p.name as product_name, p.sale_price, p.base_price
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Crear variante
  async create(variantData) {
    const { product_id, size, color, sku, barcode, stock, min_stock } = variantData;
    const result = await query(
      `INSERT INTO product_variants (product_id, size, color, sku, barcode, stock, min_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, size, color, sku, barcode, stock || 0, min_stock || 5]
    );
    return result.rows[0];
  }

  // Actualizar variante
  async update(id, variantData) {
    const { size, color, sku, barcode, min_stock } = variantData;
    const result = await query(
      `UPDATE product_variants SET size=$1, color=$2, sku=$3, barcode=$4, min_stock=$5
       WHERE id=$6 RETURNING *`,
      [size, color, sku, barcode, min_stock, id]
    );
    return result.rows[0];
  }

  // Actualizar stock de una variante
  async updateStock(id, quantityChange) {
    const result = await query(
      `UPDATE product_variants SET stock = stock + $1 WHERE id = $2 RETURNING *`,
      [quantityChange, id]
    );
    return result.rows[0];
  }

  // Obtener variantes con stock bajo (RF11)
  async findLowStock() {
    const result = await query(
      `SELECT pv.*, p.name as product_name, p.category
       FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.stock <= pv.min_stock AND pv.is_active = true AND p.is_active = true
       ORDER BY pv.stock ASC`
    );
    return result.rows;
  }

  // Soft delete de variante
  async delete(id) {
    const result = await query(
      `UPDATE product_variants SET is_active = false WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
}

module.exports = new VariantRepository();
