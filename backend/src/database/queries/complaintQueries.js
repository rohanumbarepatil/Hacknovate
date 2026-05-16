import pool from '../../config/db.js';

/**
 * Parameterized complaint SQL queries
 */
const complaintQueries = {
  async create({ category, description, lat, lng, address, filedBy, zoneId, photoUrls, priorityScore, urgencyLabel }) {
    if (!pool) return null;
    const result = await pool.query(
      `INSERT INTO complaints (category, description, location, address, filed_by, zone_id, photo_urls, priority_score, urgency_label)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6, $7, $8, $9, $10)
       RETURNING *, ST_Y(location) as lat, ST_X(location) as lng`,
      [category, description, lat, lng, address, filedBy, zoneId, photoUrls || [], priorityScore || 5, urgencyLabel || 'MEDIUM']
    );
    return result.rows[0];
  },

  async getAll({ category, status, zoneId, limit = 50, offset = 0 }) {
    if (!pool) return [];
    let query = `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (category) { query += ` AND category = $${idx++}`; params.push(category); }
    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (zoneId) { query += ` AND zone_id = $${idx++}`; params.push(zoneId); }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getMine(userId) {
    if (!pool) return [];
    const result = await pool.query(
      `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE filed_by = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getById(id) {
    if (!pool) return null;
    const result = await pool.query(
      `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM complaints WHERE id = $1`, [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status, resolvedAt = null) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE complaints SET status = $2, resolved_at = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status, resolvedAt]
    );
    return result.rows[0];
  },

  async assignTo(id, assignedTo) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE complaints SET assigned_to = $2, status = 'assigned', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, assignedTo]
    );
    return result.rows[0];
  }
};

export default complaintQueries;
