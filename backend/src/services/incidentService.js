import incidentQueries from '../database/queries/incidentQueries.js';
import zoneQueries from '../database/queries/zoneQueries.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Incident Service - Handles logic for safety incidents.
 */
const incidentService = {
  async createIncident(data, userId) {
    const { lat, lng } = data;
    
    // Auto-detect zone
    const zone = await zoneQueries.findZoneByPoint(lat, lng);
    data.zoneId = zone ? zone.id : null;
    data.reportedBy = userId;

    const incident = await incidentQueries.create(data);
    logger.success(`Incident reported: ${incident.type} at ${incident.address || 'unknown location'}`);
    return incident;
  },

  async getIncidents(filters) {
    return await incidentQueries.getAll(filters);
  },

  async getIncidentById(id) {
    const incident = await incidentQueries.getById(id);
    if (!incident) throw new NotFoundError('Incident');
    return incident;
  },

  async updateIncidentStatus(id, status) {
    const resolvedAt = status === 'resolved' ? new Date() : null;
    return await incidentQueries.updateStatus(id, status, resolvedAt);
  },

  async assignUnit(id, unitId) {
    return await incidentQueries.assignUnit(id, unitId);
  },

  async getMapData() {
    return await incidentQueries.getAsGeoJSON();
  }
};

export default incidentService;
