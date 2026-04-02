// Controlador de exportación a Excel (RF31)
const exportService = require('../services/exportService');
const reportService = require('../services/reportService');

class ExportController {
  async exportSales(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportService.salesReport(
        startDate || new Date(new Date().setDate(1)).toISOString(),
        endDate || new Date().toISOString()
      );
      const columns = exportService.getSalesColumns();
      const buffer = await exportService.exportToExcel(data, columns, 'Reporte de Ventas');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportInventory(req, res, next) {
    try {
      const data = await reportService.inventoryReport();
      const columns = exportService.getInventoryColumns();
      const buffer = await exportService.exportToExcel(data, columns, 'Inventario');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=inventario.xlsx');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportTopProducts(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await reportService.topProducts(
        startDate || new Date(new Date().setDate(1)).toISOString(),
        endDate || new Date().toISOString()
      );
      const columns = exportService.getTopProductsColumns();
      const buffer = await exportService.exportToExcel(data, columns, 'Productos más vendidos');

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=productos_mas_vendidos.xlsx');
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExportController();
