import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Map/GIS data service
 * Fetches geospatial data for map layers
 */
const mapService = {
  /**
   * Get zone boundary polygons (GeoJSON)
   */
  async getBoundaries() {
    const res = await api.get(API_ENDPOINTS.ZONES.BOUNDARIES);
    return res.data;
  },

  /**
   * Get crime heatmap data points
   */
  async getCrimeHeatmap() {
    const res = await api.get(API_ENDPOINTS.ZONES.CRIME_HEATMAP);
    return res.data;
  },

  /**
   * Get unsafe road polylines (GeoJSON)
   */
  async getUnsafeRoads() {
    const res = await api.get(API_ENDPOINTS.ZONES.UNSAFE_ROADS);
    return res.data;
  },

  /**
   * Get accident zone data (GeoJSON)
   */
  async getAccidentZones() {
    const res = await api.get(API_ENDPOINTS.ZONES.ACCIDENT_ZONES);
    return res.data;
  },

  /**
   * Get nearby help stations (hospitals, police stations)
   */
  async getHelpStations(lat, lng, radius = 5000) {
    const res = await api.get(API_ENDPOINTS.ZONES.HELP_STATIONS, {
      params: { lat, lng, radius },
    });
    return res.data;
  },

  /**
   * Get all zone risk scores
   */
  async getRiskZones() {
    const res = await api.get(API_ENDPOINTS.RISK.ZONES);
    return res.data;
  },

  /**
   * Get single zone risk detail
   */
  async getZoneRisk(zoneId) {
    const res = await api.get(API_ENDPOINTS.RISK.BY_ZONE(zoneId));
    return res.data;
  },

  /**
   * Get vehicle positions (authority only)
   */
  async getVehiclePositions() {
    const res = await api.get(API_ENDPOINTS.VEHICLES.POSITIONS);
    return res.data;
  },
};

export default mapService;
