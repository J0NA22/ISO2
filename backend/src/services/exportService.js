// Servicio de exportación a Excel (RF31)
const ExcelJS = require('exceljs');

class ExportService {
  // Exportar datos a Excel
  async exportToExcel(data, columns, sheetName = 'Reporte') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Zuleyka's Closet";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    // Configurar columnas
    worksheet.columns = columns.map((col) => ({
      header: col.header,
      key: col.key,
      width: col.width || 15,
    }));

    // Estilizar encabezados
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B6F3A' }, // Color dorado del logo
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar datos
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // Agregar bordes a todas las celdas con datos
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // Columnas predefinidas para reportes comunes
  getSalesColumns() {
    return [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Total Ventas', key: 'total_ventas', width: 15 },
      { header: 'Monto Total', key: 'monto_total', width: 18 },
      { header: 'Impuestos', key: 'impuestos_total', width: 15 },
      { header: 'Descuentos', key: 'descuentos_total', width: 15 },
      { header: 'Moneda', key: 'currency', width: 10 },
    ];
  }

  getInventoryColumns() {
    return [
      { header: 'Producto', key: 'name', width: 25 },
      { header: 'Categoría', key: 'category', width: 15 },
      { header: 'Talla', key: 'size', width: 10 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Mín. Stock', key: 'min_stock', width: 12 },
      { header: 'SKU', key: 'sku', width: 18 },
      { header: 'Precio Costo', key: 'base_price', width: 15 },
      { header: 'Precio Venta', key: 'sale_price', width: 15 },
      { header: 'Proveedor', key: 'proveedor', width: 20 },
    ];
  }

  getTopProductsColumns() {
    return [
      { header: 'Producto', key: 'name', width: 25 },
      { header: 'Categoría', key: 'category', width: 15 },
      { header: 'Talla', key: 'size', width: 10 },
      { header: 'Color', key: 'color', width: 12 },
      { header: 'Cantidad Vendida', key: 'total_vendido', width: 18 },
      { header: 'Ingresos', key: 'total_ingresos', width: 18 },
    ];
  }
}

module.exports = new ExportService();
