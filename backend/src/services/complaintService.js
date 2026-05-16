import axios from 'axios';
import complaintQueries from '../database/queries/complaintQueries.js';
import zoneQueries from '../database/queries/zoneQueries.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Complaint Service - Handles business logic for citizen complaints.
 */
const complaintService = {
  /**
   * Create a new complaint with AI-driven triage and zone detection.
   */
  async createComplaint(data, userId) {
    const { category, description, lat, lng, address, photoUrls } = data;

    if (!lat || !lng) {
      throw new ValidationError('Location (lat/lng) is required');
    }

    // 1. Detect Zone
    const zone = await zoneQueries.findZoneByPoint(lat, lng);
    const zoneId = zone ? zone.id : null;

    // 2. AI Triage (Integration with ML Microservice)
    let priorityScore = 5;
    let urgencyLabel = 'MEDIUM';
    let sentimentScore = 0.5;

    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/triage`, {
        text: description,
        category: category
      }, { timeout: 3000 });
      
      priorityScore = mlRes.data.priority_score;
      urgencyLabel = mlRes.data.urgency_label;

      const sentimentRes = await axios.post(`${ML_SERVICE_URL}/sentiment`, {
        text: description
      }, { timeout: 3000 });
      
      sentimentScore = sentimentRes.data.score;
    } catch (err) {
      logger.warn('ML Service unavailable for triage, using defaults', err.message);
    }

    // 3. Save to Database
    const complaint = await complaintQueries.create({
      category,
      description,
      lat,
      lng,
      address,
      filedBy: userId,
      zoneId,
      photoUrls,
      priorityScore,
      urgencyLabel,
      sentimentScore
    });

    logger.success(`Complaint created: ${complaint.id} (Urgency: ${urgencyLabel})`);
    return complaint;
  },

  async getComplaints(filters) {
    return await complaintQueries.getAll(filters);
  },

  async getUserComplaints(userId) {
    return await complaintQueries.getMine(userId);
  },

  async updateStatus(id, status, authorityId) {
    const complaint = await complaintQueries.getById(id);
    if (!complaint) throw new NotFoundError('Complaint');

    const resolvedAt = status === 'resolved' ? new Date() : null;
    const updated = await complaintQueries.updateStatus(id, status, resolvedAt);
    
    logger.info(`Complaint ${id} status updated to ${status} by authority ${authorityId}`);
    return updated;
  }
};

export default complaintService;
