// src/server.js
// Punto de entrada — inicializa el servidor y la conexión a BD

require('dotenv').config();
const app = require('./app');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

async function main() {
  // Verificar conexión a BD antes de arrancar
  try {
    await prisma.$connect();
    logger.info('✅ Conectado a PostgreSQL');
  } catch (err) {
    logger.error({ err }, '❌ No se pudo conectar a PostgreSQL');
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 API corriendo en http://localhost:${PORT}/api/v1`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} recibido. Cerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
