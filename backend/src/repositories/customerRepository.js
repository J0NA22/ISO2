// Repositorio de clientes (RF16, RF17)
const { query } = require('../config/database');

class CustomerRepository {
  async findAll(search = '') {
    let sql = `SELECT * FROM customers`;
    const params = [];

    if (search) {
      sql += ` WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY first_name ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async findById(id) {
    const result = await query(`SELECT * FROM customers WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async create(data) {
    const { first_name, last_name, email, phone, address } = data;
    const result = await query(
      `INSERT INTO customers (first_name, last_name, email, phone, address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name, last_name, email, phone, address]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { first_name, last_name, email, phone, address } = data;
    const result = await query(
      `UPDATE customers SET first_name=$1, last_name=$2, email=$3, phone=$4, address=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING *`,
      [first_name, last_name, email, phone, address, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    const result = await query(`DELETE FROM customers WHERE id = $1 RETURNING *`, [id]);
    return result.rows[0];
  }

  // Historial de compras de un cliente (RF17)
  async getPurchaseHistory(customerId) {
    const result = await query(
      `SELECT s.*, 
        json_agg(json_build_object(
          'product_name', p.name, 'size', pv.size, 'color', pv.color,
          'quantity', sd.quantity, 'unit_price', sd.unit_price, 'subtotal', sd.subtotal
        )) as items
       FROM sales s
       JOIN sale_details sd ON s.id = sd.sale_id
       JOIN product_variants pv ON sd.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE s.customer_id = $1 AND s.status = 'completada'
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [customerId]
    );
    return result.rows;
  }
}

module.exports = new CustomerRepository();
