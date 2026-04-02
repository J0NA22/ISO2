// Repositorio de reportes (RF18, RF19, RF20)
const { query } = require('../config/database');

class ReportRepository {
  // Reporte de ventas por rango de fechas (RF18, RF26)
  async salesReport(startDate, endDate) {
    const result = await query(
      `SELECT 
        DATE(s.created_at) as fecha,
        COUNT(*) as total_ventas,
        SUM(s.total) as monto_total,
        SUM(s.tax_amount) as impuestos_total,
        SUM(s.discount_amount) as descuentos_total,
        s.currency
       FROM sales s
       WHERE s.status = 'completada' 
         AND s.created_at >= $1 AND s.created_at <= $2
       GROUP BY DATE(s.created_at), s.currency
       ORDER BY fecha DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }

  // Productos más vendidos (RF19)
  async topProducts(startDate, endDate, limit = 10) {
    const result = await query(
      `SELECT p.name, p.category, pv.size, pv.color,
              SUM(sd.quantity) as total_vendido,
              SUM(sd.subtotal) as total_ingresos
       FROM sale_details sd
       JOIN sales s ON sd.sale_id = s.id
       JOIN product_variants pv ON sd.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE s.status = 'completada'
         AND s.created_at >= $1 AND s.created_at <= $2
       GROUP BY p.name, p.category, pv.size, pv.color
       ORDER BY total_vendido DESC
       LIMIT $3`,
      [startDate, endDate, limit]
    );
    return result.rows;
  }

  // Reporte de inventario actual (RF20)
  async inventoryReport() {
    const result = await query(`
      SELECT p.name, p.category, p.base_price, p.sale_price,
             pv.size, pv.color, pv.stock, pv.min_stock, pv.sku,
             pr.company_name as proveedor,
             (pv.stock * p.base_price) as valor_costo,
             (pv.stock * p.sale_price) as valor_venta
      FROM product_variants pv
      JOIN products p ON pv.product_id = p.id
      LEFT JOIN providers pr ON p.provider_id = pr.id
      WHERE pv.is_active = true AND p.is_active = true
      ORDER BY p.category, p.name, pv.size, pv.color
    `);
    return result.rows;
  }

  // Resumen del dashboard
  async dashboardSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const salesToday = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
       FROM sales WHERE status = 'completada' AND created_at >= $1`,
      [today]
    );

    const salesMonth = await query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
       FROM sales WHERE status = 'completada' 
       AND EXTRACT(MONTH FROM created_at) = $1
       AND EXTRACT(YEAR FROM created_at) = $2`,
      [today.getMonth() + 1, today.getFullYear()]
    );

    const totalProducts = await query(
      `SELECT COUNT(*) as count FROM products WHERE is_active = true`
    );

    const totalCustomers = await query(
      `SELECT COUNT(*) as count FROM customers`
    );

    const lowStock = await query(
      `SELECT COUNT(*) as count FROM product_variants pv
       JOIN products p ON pv.product_id = p.id
       WHERE pv.stock <= pv.min_stock AND pv.is_active = true AND p.is_active = true`
    );

    return {
      salesToday: salesToday.rows[0],
      salesMonth: salesMonth.rows[0],
      totalProducts: parseInt(totalProducts.rows[0].count),
      totalCustomers: parseInt(totalCustomers.rows[0].count),
      lowStockCount: parseInt(lowStock.rows[0].count),
    };
  }
}

module.exports = new ReportRepository();
