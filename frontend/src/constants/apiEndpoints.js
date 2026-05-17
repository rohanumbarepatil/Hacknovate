/**
 * API endpoint constants
 * Single source of truth for all backend URLs
 */

const BASE = '/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: `${BASE}/auth/login`,
    REGISTER: `${BASE}/auth/register`,
    ME: `${BASE}/auth/me`,
    PROFILE: `${BASE}/auth/profile`,
  },

  // Complaints
  COMPLAINTS: {
    BASE: `${BASE}/complaints`,
    MY: `${BASE}/complaints/my`,
    BY_ID: (id) => `${BASE}/complaints/${id}`,
    STATUS: (id) => `${BASE}/complaints/${id}/status`,
  },

  // Incidents
  INCIDENTS: {
    BASE: `${BASE}/incidents`,
    BY_ID: (id) => `${BASE}/incidents/${id}`,
    ASSIGN: (id) => `${BASE}/incidents/${id}/assign`,
    GEOJSON: `${BASE}/incidents/geojson`,
  },

  // SOS
  SOS: {
    BASE: `${BASE}/sos`,
    ACTIVE: `${BASE}/sos/active`,
    UPLOAD_AUDIO: `${BASE}/sos/upload-audio`,
    ACKNOWLEDGE: (id) => `${BASE}/sos/${id}/acknowledge`,
    RESOLVE: (id) => `${BASE}/sos/${id}/resolve`,
  },

  // Zones & GIS
  ZONES: {
    BASE: `${BASE}/zones`,
    BOUNDARIES: `${BASE}/zones/boundaries`,
    CRIME_HEATMAP: `${BASE}/zones/crime-heatmap`,
    UNSAFE_ROADS: `${BASE}/zones/unsafe-roads`,
    ACCIDENT_ZONES: `${BASE}/zones/accident-zones`,
    HELP_STATIONS: `${BASE}/zones/help-stations`,
  },

  // Vehicles
  VEHICLES: {
    POSITIONS: `${BASE}/vehicles/positions`,
    BY_ID: (id) => `${BASE}/vehicles/${id}`,
    HISTORY: (id) => `${BASE}/vehicles/${id}/history`,
    STATUS: (id) => `${BASE}/vehicles/${id}/status`,
  },

  // Risk & AI
  RISK: {
    ZONES: `${BASE}/risk/zones`,
    BY_ZONE: (id) => `${BASE}/risk/zones/${id}`,
    FORECAST: (zoneId) => `${BASE}/risk/forecast/${zoneId}`,
    RECOMMENDATIONS: (zoneId) => `${BASE}/risk/recommendations/${zoneId}`,
  },

  // Analytics
  ANALYTICS: {
    DASHBOARD: `${BASE}/analytics/dashboard`,
    TRENDS: `${BASE}/analytics/trends`,
    CATEGORIES: `${BASE}/analytics/categories`,
    RESPONSE_TIMES: `${BASE}/analytics/response-times`,
    ZONES: `${BASE}/analytics/zones`,
  },
};

export default API_ENDPOINTS;
