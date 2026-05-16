import pool from '../../config/db.js';

/**
 * Parameterized incident SQL queries
 */
const incidentQueries = {
  async create({ type, title, description, severity, lat, lng, address, reportedBy, zoneId, photoUrls }) {
    if (!pool) return null;
    const result = await pool.query(
      `INSERT INTO incidents (type, title, description, severity, location, address, reported_by, zone_id, photo_urls)
       VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($6, $5), 4326), $7, $8, $9, $10)
       RETURNING *, ST_Y(location) as lat, ST_X(location) as lng`,
      [type, title, description, severity, lat, lng, address, reportedBy, zoneId, photoUrls || []]
    );
    return result.rows[0];
  },

  async getAll({ type, status, zoneId, limit = 50, offset = 0 }) {
    if (!pool) return [];
    let query = `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM incidents WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (type) { query += ` AND type = $${idx++}`; params.push(type); }
    if (status) { query += ` AND status = $${idx++}`; params.push(status); }
    if (zoneId) { query += ` AND zone_id = $${idx++}`; params.push(zoneId); }

    query += ` ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    if (!pool) return null;
    const result = await pool.query(
      `SELECT *, ST_Y(location) as lat, ST_X(location) as lng FROM incidents WHERE id = $1`, [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status, resolvedAt = null) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE incidents SET status = $2, resolved_at = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status, resolvedAt]
    );
    return result.rows[0];
  },

  async assignUnit(id, unitId) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE incidents SET assigned_unit = $2, status = 'in_progress', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, unitId]
    );
    return result.rows[0];
  },

  async getAsGeoJSON(type = null) {
    if (!pool) return [];
    let query = `SELECT id, type, title, severity, status, ST_Y(location) as lat, ST_X(location) as lng, created_at FROM incidents WHERE 1=1`;
    const params = [];
    if (type) { query += ` AND type = $1`; params.push(type); }
    query += ` ORDER BY created_at DESC LIMIT 200`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  async count(filters = {}) {
    if (!pool) return 0;
    let query = `SELECT COUNT(*) FROM incidents WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (filters.type) { query += ` AND type = $${idx++}`; params.push(filters.type); }
    if (filters.status) { query += ` AND status = $${idx++}`; params.push(filters.status); }
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  },
};

export default incidentQueries;
