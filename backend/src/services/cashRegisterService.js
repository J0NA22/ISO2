// Servicio de caja registradora (RF30)
const cashRegisterRepository = require('../repositories/cashRegisterRepository');
const AppError = require('../utils/AppError');

class CashRegisterService {
  // Abrir caja
  async open(userId, openingAmount, currency = 'NIO') {
    // Verificar si ya tiene una caja abierta
    const existing = await cashRegisterRepository.findOpenByUser(userId);
    if (existing) {
      throw AppError.conflict('Ya tiene una caja abierta. Debe cerrarla primero.');
    }

    return await cashRegisterRepository.open(userId, openingAmount, currency);
  }

  // Cerrar caja
  async close(userId, closingAmount) {
    const openRegister = await cashRegisterRepository.findOpenByUser(userId);
    if (!openRegister) {
      throw AppError.notFound('No tiene ninguna caja abierta');
    }

    // Calcular monto esperado
    const expectedAmount = await cashRegisterRepository.calculateExpected(openRegister.id);

    // Actualizar expected_amount antes de cerrar
    const { query } = require('../config/database');
    await query(
      `UPDATE cash_registers SET expected_amount = $1 WHERE id = $2`,
      [expectedAmount, openRegister.id]
    );

    const closed = await cashRegisterRepository.close(openRegister.id, closingAmount);

    return {
      ...closed,
      expected_amount: expectedAmount,
      difference: parseFloat(closingAmount) - expectedAmount,
    };
  }

  // Obtener caja abierta del usuario actual
  async getOpen(userId) {
    return await cashRegisterRepository.findOpenByUser(userId);
  }

  // Historial de cajas
  async getHistory(filters) {
    return await cashRegisterRepository.findAll(filters);
  }
}

module.exports = new CashRegisterService();
