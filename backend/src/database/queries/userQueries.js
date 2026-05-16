import pool from '../../config/db.js';

/**
 * Parameterized user SQL queries for Auth and Profile management.
 */
const userQueries = {
  async findByFirebaseUid(uid) {
    if (!pool) return null;
    const result = await pool.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    return result.rows[0];
  },

  async create({ firebaseUid, name, email, phone, role, avatarUrl }) {
    if (!pool) return null;
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, name, email, phone, role, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [firebaseUid, name, email, phone, role || 'citizen', avatarUrl]
    );
    return result.rows[0];
  },

  async update(id, updates) {
    if (!pool) return null;
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (['name', 'phone', 'avatar_url', 'ward_id', 'is_active'].includes(key)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateLastLogin(uid) {
    if (!pool) return;
    await pool.query('UPDATE users SET last_login = NOW() WHERE firebase_uid = $1', [uid]);
  }
};

export default userQueries;
