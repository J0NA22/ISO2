// Repositorio de inventario (RF6, RF10, RF11, RF12)
const { query } = require('../config/database');

class InventoryRepository {
  // Obtener inventario completo con info de producto (RF10)
  async getFullInventory(filters = {}) {
    let sql = `
      SELECT pv.*, p.name as product_name, p.category, p.sale_price,
             p.base_price, pr.company_name as provider_name
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN providers pr ON p.provider_id = pr.id
      WHERE pv.is_active = true AND p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (filters.category) {
      paramCount++;
      sql += ` AND p.category = $${paramCount}`;
      params.push(filters.category);
    }

    if (filters.lowStock) {
      sql += ` AND pv.stock <= pv.min_stock`;
    }

    sql += ' ORDER BY p.name, pv.size, pv.color';

    const result = await query(sql, params);
    return result.rows;
  }

  // Registrar entrada de inventario (RF12)
  async createEntry(entryData) {
    const { variant_id, provider_id, user_id, entry_type, quantity, reason } = entryData;
    const result = await query(
      `INSERT INTO inventory_entries (variant_id, provider_id, user_id, entry_type, quantity, reason)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [variant_id, provider_id, user_id, entry_type, quantity, reason]
    );
    return result.rows[0];
  }

  // Obtener historial de movimientos de una variante
  async getEntries(variantId) {
    const result = await query(
      `SELECT ie.*, u.first_name as user_name, u.last_name as user_last_name,
              pr.company_name as provider_name
       FROM inventory_entries ie
       JOIN users u ON ie.user_id = u.id
       LEFT JOIN providers pr ON ie.provider_id = pr.id
       WHERE ie.variant_id = $1
       ORDER BY ie.created_at DESC`,
      [variantId]
    );
    return result.rows;
  }

  // Resumen de inventario para reportes
  async getSummary() {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COUNT(pv.id) as total_variants,
        COALESCE(SUM(pv.stock), 0) as total_stock,
        COUNT(CASE WHEN pv.stock <= pv.min_stock THEN 1 END) as low_stock_count,
        COUNT(CASE WHEN pv.stock = 0 THEN 1 END) as out_of_stock_count
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      WHERE pv.is_active = true AND p.is_active = true
    `);
    return result.rows[0];
  }
}

module.exports = new InventoryRepository();
