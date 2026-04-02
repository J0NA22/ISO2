// Servicio de reportes (RF18, RF19, RF20)
const reportRepository = require('../repositories/reportRepository');

class ReportService {
  // Reporte de ventas (RF18)
  async salesReport(startDate, endDate) {
    return await reportRepository.salesReport(startDate, endDate);
  }

  // Productos más vendidos (RF19)
  async topProducts(startDate, endDate, limit) {
    return await reportRepository.topProducts(startDate, endDate, limit);
  }

  // Inventario actual (RF20)
  async inventoryReport() {
    return await reportRepository.inventoryReport();
  }

  // Resumen del dashboard
  async dashboardSummary() {
    return await reportRepository.dashboardSummary();
  }
}

module.exports = new ReportService();
