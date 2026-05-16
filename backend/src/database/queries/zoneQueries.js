import pool from '../../config/db.js';

/**
 * Parameterized zone and GIS SQL queries
 */
const zoneQueries = {
  async getAll() {
    if (!pool) return [];
    const result = await pool.query(
      `SELECT id, name, ward_number, area_sq_km, population, category, ST_AsGeoJSON(boundary)::json as boundary_geojson FROM zones WHERE is_active = TRUE`
    );
    return result.rows;
  },

  async getById(id) {
    if (!pool) return null;
    const result = await pool.query(
      `SELECT *, ST_AsGeoJSON(boundary)::json as boundary_geojson FROM zones WHERE id = $1`, [id]
    );
    return result.rows[0];
  },

  async findZoneByPoint(lat, lng) {
    if (!pool) return null;
    const result = await pool.query(
      `SELECT id, name, ward_number FROM zones 
       WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint($2, $1), 4326)) LIMIT 1`,
      [lat, lng]
    );
    return result.rows[0];
  },

  async getRiskScores() {
    if (!pool) return [];
    const result = await pool.query(
      `SELECT z.id, z.name, r.overall_score as score, r.risk_level, ST_AsGeoJSON(z.boundary)::json as boundary_geojson
       FROM zones z
       LEFT JOIN risk_scores r ON z.id = r.zone_id
       WHERE z.is_active = TRUE`
    );
    return result.rows;
  },

  async getUnsafeRoads() {
    if (!pool) return [];
    // This is a placeholder as the schema for unsafe roads wasn't fully defined in migrations
    // but the frontend expects it. We can mock it or use a separate table if needed.
    return [
        { name: 'NH4 Bypass', danger_level: 8, path: [{lat: 17.6900, lng: 74.0100}, {lat: 17.6940, lng: 74.0180}] }
    ];
  }
};

export default zoneQueries;
