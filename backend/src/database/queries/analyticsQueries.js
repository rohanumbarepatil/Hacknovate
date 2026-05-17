import pool from '../../config/db.js';

/**
 * Aggregated analytics SQL queries for dashboards.
 */
const analyticsQueries = {
  async getGlobalStats() {
    if (!pool) return {
        totalIncidents: 0,
        activeAlerts: 0,
        pendingComplaints: 0,
        resolvedToday: 0
    };
    
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM incidents) as total_incidents,
        (SELECT COUNT(*) FROM sos_alerts WHERE status != 'resolved' AND status != 'false_alarm') as active_alerts,
        (SELECT COUNT(*) FROM complaints WHERE status = 'pending') as pending_complaints,
        (SELECT COUNT(*) FROM incidents WHERE status = 'resolved' AND resolved_at >= CURRENT_DATE) as resolved_today
    `);
    
    const row = result.rows[0];
    const totalPending = parseInt(row.pending_complaints) + parseInt(row.active_alerts);
    const riskScore = Math.min(10, (totalPending / 50) * 10); // scale 0-10
    
    return {
      totalIncidents: parseInt(row.total_incidents),
      activeAlerts: parseInt(row.active_alerts),
      pendingComplaints: parseInt(row.pending_complaints),
      resolvedToday: parseInt(row.resolved_today),
      avgRiskScore: riskScore || 2.4,
      lastSync: new Date().toISOString()
    };
  },

  async getIncidentTrends(days = 7) {
    if (!pool) return [];
    const result = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM incidents
      WHERE created_at >= NOW() - INTERVAL '1 day' * $1
      GROUP BY date
      ORDER BY date ASC
    `, [days]);
    return result.rows;
  },

  async getCategoryBreakdown() {
    if (!pool) return [];
    const result = await pool.query(`
      SELECT category as label, COUNT(*) as value
      FROM complaints
      GROUP BY category
    `);
    return result.rows;
  },

  async getZoneComparison() {
    if (!pool) return [];
    const result = await pool.query(`
      SELECT 
        z.name,
        COUNT(i.id) as incident_count,
        r.overall_score as risk_score
      FROM zones z
      LEFT JOIN incidents i ON z.id = i.zone_id
      LEFT JOIN risk_scores r ON z.id = r.zone_id
      GROUP BY z.id, z.name, r.overall_score
      ORDER BY risk_score DESC
    `);
    return result.rows;
  }
};

export default analyticsQueries;
