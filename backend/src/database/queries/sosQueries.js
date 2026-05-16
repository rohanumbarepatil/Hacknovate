import pool from '../../config/db.js';

/**
 * Parameterized SOS alert SQL queries
 */
const sosQueries = {
  async create({ citizenId, lat, lng }) {
    if (!pool) return null;
    const result = await pool.query(
      `INSERT INTO sos_alerts (citizen_id, location)
       VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326))
       RETURNING *, ST_Y(location) as lat, ST_X(location) as lng`,
      [citizenId, lat, lng]
    );
    return result.rows[0];
  },

  async getActive() {
    if (!pool) return [];
    const result = await pool.query(
      `SELECT s.*, ST_Y(s.location) as lat, ST_X(s.location) as lng, u.name as citizen_name, u.phone as citizen_phone
       FROM sos_alerts s
       JOIN users u ON s.citizen_id = u.id
       WHERE s.status IN ('active', 'acknowledged', 'responding')
       ORDER BY s.created_at DESC`
    );
    return result.rows;
  },

  async acknowledge(id, responderId) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE sos_alerts SET status = 'acknowledged', responder_id = $2 WHERE id = $1 RETURNING *`,
      [id, responderId]
    );
    return result.rows[0];
  },

  async resolve(id, status = 'resolved') {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE sos_alerts SET status = $2, resolved_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return result.rows[0];
  }
};

export default sosQueries;
