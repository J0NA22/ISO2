// Configuración del pool de conexiones a PostgreSQL
const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  console.log('📦 Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
});

// Función auxiliar para ejecutar queries
const query = (text, params) => pool.query(text, params);

// Función para obtener un cliente del pool (para transacciones)
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };
