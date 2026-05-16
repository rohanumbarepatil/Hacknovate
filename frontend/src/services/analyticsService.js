import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Analytics API service
 * Fetches dashboard metrics, trends, and aggregated data
 */
const analyticsService = {
  async getDashboard() {
    const res = await api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD);
    return res.data;
  },

  async getTrends(params = { period: '7d' }) {
    const res = await api.get(API_ENDPOINTS.ANALYTICS.TRENDS, { params });
    return res.data;
  },

  async getCategories() {
    const res = await api.get(API_ENDPOINTS.ANALYTICS.CATEGORIES);
    return res.data;
  },

  async getResponseTimes() {
    const res = await api.get(API_ENDPOINTS.ANALYTICS.RESPONSE_TIMES);
    return res.data;
  },

  async getZoneStats() {
    const res = await api.get(API_ENDPOINTS.ANALYTICS.ZONES);
    return res.data;
  },

  /**
   * Get AI-generated insights for a specific zone
   */
  async getAIInsights(zoneId) {
    const res = await api.get(API_ENDPOINTS.RISK.RECOMMENDATIONS(zoneId));
    return res.data;
  },

  /**
   * Get forecast data for a zone
   */
  async getForecast(zoneId) {
    const res = await api.get(API_ENDPOINTS.RISK.FORECAST(zoneId));
    return res.data;
  },
};

export default analyticsService;
