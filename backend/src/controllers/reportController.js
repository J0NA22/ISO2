// Controlador de reportes (RF18, RF19, RF20, RF26)
const reportService = require('../services/reportService');

class ReportController {
  async salesReport(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.salesReport(
        startDate || new Date(new Date().setDate(1)).toISOString(),
        endDate || new Date().toISOString()
      );
      res.json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async topProducts(req, res, next) {
    try {
      const { startDate, endDate, limit } = req.query;
      const report = await reportService.topProducts(
        startDate || new Date(new Date().setDate(1)).toISOString(),
        endDate || new Date().toISOString(),
        limit ? parseInt(limit) : 10
      );
      res.json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async inventoryReport(req, res, next) {
    try {
      const report = await reportService.inventoryReport();
      res.json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  }

  async dashboard(req, res, next) {
    try {
      const summary = await reportService.dashboardSummary();
      res.json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
