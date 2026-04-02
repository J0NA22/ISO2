// Repositorio de ventas (RF1, RF5, RF25, RF26)
const { query, getClient } = require('../config/database');

class SaleRepository {
  // Crear venta con sus detalles (transacción)
  async create(saleData, details) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Generar número de venta único
      const saleNumber = await this.generateSaleNumber(client);

      // Insertar la venta
      const saleResult = await client.query(
        `INSERT INTO sales (sale_number, customer_id, user_id, cash_register_id, subtotal, tax_rate, tax_amount, discount_amount, total, currency, exchange_rate, payment_method, status, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          saleNumber, saleData.customer_id, saleData.user_id, saleData.cash_register_id,
          saleData.subtotal, saleData.tax_rate, saleData.tax_amount, saleData.discount_amount,
          saleData.total, saleData.currency, saleData.exchange_rate,
          saleData.payment_method, 'completada', saleData.notes,
        ]
      );

      const sale = saleResult.rows[0];

      // Insertar detalles de la venta
      for (const detail of details) {
        await client.query(
          `INSERT INTO sale_details (sale_id, variant_id, quantity, unit_price, discount, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [sale.id, detail.variant_id, detail.quantity, detail.unit_price, detail.discount || 0, detail.subtotal]
        );

        // Actualizar stock de la variante (RF6 - automático)
        await client.query(
          `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
          [detail.quantity, detail.variant_id]
        );
      }

      await client.query('COMMIT');
      return sale;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Generar número de venta secuencial
  async generateSaleNumber(client) {
    const result = await client.query(
      `SELECT COUNT(*) + 1 as next_number FROM sales`
    );
    const number = result.rows[0].next_number;
    const date = new Date();
    const prefix = `ZC-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    return `${prefix}-${String(number).padStart(6, '0')}`;
  }

  // Obtener venta por ID con detalles
  async findById(id) {
    const saleResult = await query(
      `SELECT s.*, u.first_name as seller_first_name, u.last_name as seller_last_name,
              c.first_name as customer_first_name, c.last_name as customer_last_name, c.phone as customer_phone
       FROM sales s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN customers c ON s.customer_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (saleResult.rows.length === 0) return null;

    const detailsResult = await query(
      `SELECT sd.*, p.name as product_name, pv.size, pv.color, pv.sku
       FROM sale_details sd
       JOIN product_variants pv ON sd.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE sd.sale_id = $1`,
      [id]
    );

    return {
      ...saleResult.rows[0],
      details: detailsResult.rows,
    };
  }

  // Listar ventas con filtros (RF25, RF26)
  async findAll(filters = {}) {
    let sql = `
      SELECT s.*, u.first_name as seller_name, u.last_name as seller_last_name,
             c.first_name as customer_name, c.last_name as customer_last_name
      FROM sales s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      sql += ` AND s.status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.startDate) {
      paramCount++;
      sql += ` AND s.created_at >= $${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      sql += ` AND s.created_at <= $${paramCount}`;
      params.push(filters.endDate);
    }

    if (filters.userId) {
      paramCount++;
      sql += ` AND s.user_id = $${paramCount}`;
      params.push(filters.userId);
    }

    sql += ' ORDER BY s.created_at DESC';

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Cancelar venta (RF5) - devuelve stock
  async cancel(id) {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Obtener detalles de la venta
      const details = await client.query(
        `SELECT * FROM sale_details WHERE sale_id = $1`,
        [id]
      );

      // Devolver stock de cada variante
      for (const detail of details.rows) {
        await client.query(
          `UPDATE product_variants SET stock = stock + $1 WHERE id = $2`,
          [detail.quantity, detail.variant_id]
        );
      }

      // Marcar venta como cancelada
      const result = await client.query(
        `UPDATE sales SET status = 'cancelada' WHERE id = $1 AND status = 'completada' RETURNING *`,
        [id]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new SaleRepository();
