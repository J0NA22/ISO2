// Servicio de inventario (RF6, RF10, RF11, RF12)
const inventoryRepository = require('../repositories/inventoryRepository');
const variantRepository = require('../repositories/variantRepository');
const AppError = require('../utils/AppError');

class InventoryService {
  // Obtener inventario completo (RF10)
  async getInventory(filters) {
    return await inventoryRepository.getFullInventory(filters);
  }

  // Alertas de stock bajo (RF11)
  async getLowStock() {
    return await variantRepository.findLowStock();
  }

  // Registrar entrada de inventario (RF12)
  async addEntry(entryData, userId) {
    const variant = await variantRepository.findById(entryData.variant_id);
    if (!variant) {
      throw AppError.notFound('Variante de producto no encontrada');
    }

    // Determinar el cambio de stock según el tipo de entrada
    let quantityChange = entryData.quantity;
    if (entryData.entry_type === 'salida') {
      quantityChange = -Math.abs(quantityChange);
      // Verificar que hay suficiente stock
      if (variant.stock + quantityChange < 0) {
        throw AppError.badRequest('No hay suficiente stock para esta salida');
      }
    } else if (entryData.entry_type === 'ajuste') {
      // En ajuste, el quantity puede ser positivo o negativo
      quantityChange = entryData.quantity;
    }

    // Actualizar stock de la variante
    await variantRepository.updateStock(entryData.variant_id, quantityChange);

    // Registrar la entrada en el historial
    const entry = await inventoryRepository.createEntry({
      ...entryData,
      quantity: entryData.quantity,
      user_id: userId,
    });

    return entry;
  }

  // Obtener historial de movimientos
  async getEntries(variantId) {
    return await inventoryRepository.getEntries(variantId);
  }

  // Obtener resumen de inventario
  async getSummary() {
    return await inventoryRepository.getSummary();
  }
}

module.exports = new InventoryService();
