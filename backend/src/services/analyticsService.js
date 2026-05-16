import analyticsQueries from '../database/queries/analyticsQueries.js';
import axios from 'axios';
import logger from '../utils/logger.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Analytics Service - Aggregates data for dashboards and fetches AI insights.
 */
const analyticsService = {
  async getDashboardStats() {
    const stats = await analyticsQueries.getGlobalStats();
    return stats;
  },

  async getTrends(days = 7) {
    return await analyticsQueries.getIncidentTrends(days);
  },

  async getCategoryStats() {
    return await analyticsQueries.getCategoryBreakdown();
  },

  async getZoneComparison() {
    return await analyticsQueries.getZoneComparison();
  },

  /**
   * Fetch AI forecast for a specific zone from the ML service.
   */
  async getZoneForecast(zoneId) {
    try {
      const res = await axios.get(`${ML_SERVICE_URL}/forecast/${zoneId}`);
      return res.data;
    } catch (err) {
      logger.warn(`Could not fetch forecast for zone ${zoneId}: ${err.message}`);
      return null;
    }
  }
};

export default analyticsService;
