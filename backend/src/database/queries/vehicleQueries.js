import pool from '../../config/db.js';

/**
 * Emergency unit and vehicle tracking SQL queries.
 */
const vehicleQueries = {
  async getAll() {
    if (!pool) return [];
    const result = await pool.query(
      `SELECT *, ST_Y(current_location) as lat, ST_X(current_location) as lng FROM emergency_units`
    );
    return result.rows;
  },

  async updatePosition(id, lat, lng, speed, heading) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE emergency_units 
       SET current_location = ST_SetSRID(ST_MakePoint($3, $2), 4326),
           speed = $4,
           heading = $5,
           last_ping = NOW()
       WHERE id = $1
       RETURNING *, ST_Y(current_location) as lat, ST_X(current_location) as lng`,
      [id, lat, lng, speed, heading]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    if (!pool) return null;
    const result = await pool.query(
      `UPDATE emergency_units SET status = $2 WHERE id = $1 RETURNING *`,
      [id, status]
    );
    return result.rows[0];
  }
};

export default vehicleQueries;
