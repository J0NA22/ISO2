// Repositorio de usuarios (RF21, RF22)
const { query } = require('../config/database');

class UserRepository {
  async findAll() {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              r.name as role_name, r.id as role_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );
    return result.rows;
  }

  async findById(id) {
    const result = await query(
      `SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              r.name as role_name, r.id as role_id
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Buscar por username (para login)
  async findByUsername(username) {
    const result = await query(
      `SELECT u.*, r.name as role_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  async create(data) {
    const { username, email, password_hash, first_name, last_name, role_id } = data;
    const result = await query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, first_name, last_name, role_id, is_active, created_at`,
      [username, email, password_hash, first_name, last_name, role_id]
    );
    return result.rows[0];
  }

  async update(id, data) {
    const { email, first_name, last_name, role_id, is_active } = data;
    const result = await query(
      `UPDATE users SET email=$1, first_name=$2, last_name=$3, role_id=$4, is_active=$5, updated_at=CURRENT_TIMESTAMP
       WHERE id=$6 RETURNING id, username, email, first_name, last_name, role_id, is_active`,
      [email, first_name, last_name, role_id, is_active, id]
    );
    return result.rows[0];
  }

  async updatePassword(id, passwordHash) {
    await query(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [passwordHash, id]
    );
  }

  async delete(id) {
    const result = await query(
      `UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }

  // Obtener todos los roles
  async findAllRoles() {
    const result = await query(`SELECT * FROM roles ORDER BY id`);
    return result.rows;
  }
}

module.exports = new UserRepository();
