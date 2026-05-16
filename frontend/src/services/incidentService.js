import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Incident API service
 * All incident-related HTTP calls go through here
 */
const incidentService = {
  async create(incidentData) {
    const res = await api.post(API_ENDPOINTS.INCIDENTS.BASE, incidentData);
    return res.data;
  },

  async getAll(params = {}) {
    const res = await api.get(API_ENDPOINTS.INCIDENTS.BASE, { params });
    return res.data;
  },

  async getById(id) {
    const res = await api.get(API_ENDPOINTS.INCIDENTS.BY_ID(id));
    return res.data;
  },

  async update(id, updates) {
    const res = await api.put(API_ENDPOINTS.INCIDENTS.BY_ID(id), updates);
    return res.data;
  },

  async assignUnit(id, unitId) {
    const res = await api.put(API_ENDPOINTS.INCIDENTS.ASSIGN(id), { unitId });
    return res.data;
  },

  /**
   * Get incidents as GeoJSON for map rendering
   */
  async getGeoJSON(params = {}) {
    const res = await api.get(API_ENDPOINTS.INCIDENTS.GEOJSON, { params });
    return res.data;
  },
};

export default incidentService;
