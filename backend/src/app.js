// Configuración principal de Express
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const cashRegisterRoutes = require('./routes/cashRegisterRoutes');
const reportRoutes = require('./routes/reportRoutes');
const exportRoutes = require('./routes/exportRoutes');
const configRoutes = require('./routes/configRoutes');

const app = express();

// ============================================
// MIDDLEWARE GLOBAL
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS DE LA API
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/cash-register', cashRegisterRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/config', configRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: "Zuleyka's Closet API está funcionando", timestamp: new Date() });
});

// ============================================
// MANEJO DE ERRORES
// ============================================
// Ruta no encontrada
app.all('*', (req, res) => {
  res.status(404).json({ status: 'fail', message: `Ruta ${req.originalUrl} no encontrada` });
});

// Handler de errores global
app.use(errorHandler);

module.exports = app;
