// Repositorio de caja registradora (RF30)
const { query } = require('../config/database');

class CashRegisterRepository {
  // Abrir caja
  async open(userId, openingAmount, currency) {
    const result = await query(
      `INSERT INTO cash_registers (user_id, opening_amount, currency) VALUES ($1, $2, $3) RETURNING *`,
      [userId, openingAmount, currency]
    );
    return result.rows[0];
  }

  // Cerrar caja
  async close(id, closingAmount) {
    const result = await query(
      `UPDATE cash_registers SET closing_amount=$1, status='closed', closed_at=CURRENT_TIMESTAMP
       WHERE id=$2 AND status='open' RETURNING *`,
      [closingAmount, id]
    );
    return result.rows[0];
  }

  // Obtener caja abierta del usuario
  async findOpenByUser(userId) {
    const result = await query(
      `SELECT * FROM cash_registers WHERE user_id = $1 AND status = 'open' ORDER BY opened_at DESC LIMIT 1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  // Obtener historial de cajas
  async findAll(filters = {}) {
    let sql = `
      SELECT cr.*, u.first_name, u.last_name, u.username
      FROM cash_registers cr
      JOIN users u ON cr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filters.userId) {
      paramCount++;
      sql += ` AND cr.user_id = $${paramCount}`;
      params.push(filters.userId);
    }

    if (filters.status) {
      paramCount++;
      sql += ` AND cr.status = $${paramCount}`;
      params.push(filters.status);
    }

    sql += ' ORDER BY cr.opened_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  // Calcular monto esperado (ventas durante la caja)
  async calculateExpected(registerId) {
    const result = await query(
      `SELECT cr.opening_amount, COALESCE(SUM(s.total), 0) as sales_total
       FROM cash_registers cr
       LEFT JOIN sales s ON s.cash_register_id = cr.id AND s.status = 'completada'
       WHERE cr.id = $1
       GROUP BY cr.opening_amount`,
      [registerId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return parseFloat(row.opening_amount) + parseFloat(row.sales_total);
  }
}

module.exports = new CashRegisterRepository();
