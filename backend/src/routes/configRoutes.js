// Router principal - agrega un prefijo de configuración de precios
const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { query } = require('../config/database');

const router = Router();

// Rutas de configuración de precios (RF27)
router.get('/price-configs', authMiddleware, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM price_configs ORDER BY id');
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    next(error);
  }
});

router.put('/price-configs/:id', authMiddleware, roleMiddleware('admin'), async (req, res, next) => {
  try {
    const { name, tax_rate, currency, exchange_rate, is_default } = req.body;
    const result = await query(
      `UPDATE price_configs SET name=$1, tax_rate=$2, currency=$3, exchange_rate=$4, is_default=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
      [name, tax_rate, currency, exchange_rate, is_default, req.params.id]
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
