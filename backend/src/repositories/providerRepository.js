// Repositorio de proveedores (RF33)
const { query } = require('../config/database');

class ProviderRepository {
  async findAll(search = '') {
    let sql = `SELECT * FROM providers WHERE is_active = true`;
    const params = [];

    if (search) {
      sql += ` AND (company_name ILIKE $1 OR contact_name ILIKE $1)`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY company_name ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async findById(id) {
    const result = await query(`SELECT * FROM providers WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async create(data) {
    const { company_name, contact_name, email, phone, address } = data;
    const result = await query(
      `INSERT INTO providers (company_name, contact_name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [company_name, contact_name, email, phone, address]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { company_name, contact_name, email, phone, address } = data;
    const result = await query(
      `UPDATE providers SET company_name=$1, contact_name=$2, email=$3, phone=$4, address=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [company_name, contact_name, email, phone, address, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await query(
      `UPDATE providers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Obtener productos de un proveedor
  async getProducts(providerId) {
    const result = await query(
      `SELECT p.*, 
        (SELECT COALESCE(SUM(pv.stock), 0) FROM product_variants pv WHERE pv.product_id = p.id) as total_stock
       FROM products p WHERE p.provider_id = $1 AND p.is_active = true ORDER BY p.name`,
      [providerId]
    );
    return result.rows;
  }
}

module.exports = new ProviderRepository();
