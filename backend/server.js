// Punto de entrada del servidor
const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║     🛍️  Zuleyka's Closet - POS System         ║
  ║     🚀 Servidor corriendo en puerto ${PORT}      ║
  ║     📡 API: http://localhost:${PORT}/api          ║
  ║     🏥 Health: http://localhost:${PORT}/api/health║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});
