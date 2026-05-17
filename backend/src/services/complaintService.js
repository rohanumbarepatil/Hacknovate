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
    const { category, description, address, imageUrl } = data;
    
    // Safely extract coordinates
    const lat = parseFloat(data.lat || data.latitude || 18.5204);
    const lng = parseFloat(data.lng || data.longitude || 73.8567);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new ValidationError('Valid coordinates (lat/lng) are required');
    }

    // 1. Detect Zone (Google Maps spatial polygon ward helper)
    let zoneId = null;
    try {
      const zone = await zoneQueries.findZoneByPoint(lat, lng);
      zoneId = zone ? zone.id : null;
    } catch (err) {
      logger.warn('Failed to detect zone by spatial query:', err.message);
    }

    // 2. AI Triage & Severity (Integration with ML Microservice or keyword heuristics)
    let priorityScore = 5;
    let urgencyLabel = 'MEDIUM';
    let sentimentScore = 0.5;

    // Smart severity detection from description keywords
    const descLower = (description || '').toLowerCase();
    if (descLower.includes('critical') || descLower.includes('accident') || descLower.includes('severe') || descLower.includes('danger') || descLower.includes('emergency')) {
      urgencyLabel = 'CRITICAL';
      priorityScore = 9;
    } else if (descLower.includes('broken') || descLower.includes('overflowing') || descLower.includes('leak') || descLower.includes('jam')) {
      urgencyLabel = 'HIGH';
      priorityScore = 7;
    }

    try {
      const mlRes = await axios.post(`${ML_SERVICE_URL}/triage`, {
        text: description,
        category: category
      }, { timeout: 1500 });
      
      priorityScore = mlRes.data.priority_score || priorityScore;
      urgencyLabel = mlRes.data.urgency_label || urgencyLabel;

      const sentimentRes = await axios.post(`${ML_SERVICE_URL}/sentiment`, {
        text: description
      }, { timeout: 1500 });
      
      sentimentScore = sentimentRes.data.score || sentimentScore;
    } catch (err) {
      logger.warn('ML Service unavailable for triage, using default rules');
    }

    // 3. Save to Database
    const complaint = await complaintQueries.create({
      category: category || 'other',
      description: description || '',
      lat,
      lng,
      address: address || 'Pune Ward Sector',
      filedBy: userId,
      zoneId,
      imageUrl,
      photoUrls: [imageUrl],
      priorityScore,
      urgencyLabel,
      sentimentScore
    });

    logger.success(`Complaint created: ${complaint.id} (Severity: ${urgencyLabel})`);
    return complaint;
  },

  async getComplaints(filters) {
    return await complaintQueries.getAll(filters);
  },

  async getUserComplaints(userId) {
    return await complaintQueries.getMine(userId);
  },

  async getComplaintById(id) {
    return await complaintQueries.getById(id);
  },

  async updateStatus(id, status, authorityId, options = {}) {
    const complaint = await complaintQueries.getById(id);
    if (!complaint) throw new NotFoundError('Complaint');

    const lowerStatus = String(status).toLowerCase();
    
    // Normalize status into proper workflow states
    let normalizedStatus = status;
    if (lowerStatus.includes('review')) normalizedStatus = 'Under Review';
    else if (lowerStatus.includes('assign')) normalizedStatus = 'Assigned';
    else if (lowerStatus.includes('progress')) normalizedStatus = 'In Progress';
    else if (lowerStatus.includes('resolve')) normalizedStatus = 'Resolved';
    else if (lowerStatus.includes('reject')) normalizedStatus = 'Rejected';
    else if (lowerStatus.includes('submit')) normalizedStatus = 'Submitted';

    const resolvedAt = normalizedStatus === 'Resolved' ? new Date() : null;
    
    // Determine assigned department based on category if assigning
    let assignedDept = options.assignedDepartment;
    if (!assignedDept && normalizedStatus === 'Assigned') {
      const cat = String(complaint.category).toLowerCase();
      if (cat.includes('road')) assignedDept = 'PMC Road Dept.';
      else if (cat.includes('light')) assignedDept = 'MSEB Grid Authority';
      else if (cat.includes('sanit') || cat.includes('waste') || cat.includes('garbage')) assignedDept = 'PMC Sanitation Division';
      else if (cat.includes('traffic')) assignedDept = 'Pune Traffic Control';
      else assignedDept = 'PMC Operations Unit';
    }

    let eta = options.eta;
    if (!eta && normalizedStatus === 'Assigned') {
      eta = '24 Hours';
    } else if (!eta && normalizedStatus === 'In Progress') {
      eta = '4 Hours';
    } else if (normalizedStatus === 'Resolved') {
      eta = 'Completed';
    }

    const updated = await complaintQueries.updateStatus(id, normalizedStatus, resolvedAt, {
      note: options.note,
      assignedDepartment: assignedDept || complaint.assignedDepartment,
      eta: eta || complaint.eta,
      updatedBy: 'Authority Command'
    });
    
    logger.info(`Complaint ${id} status updated to ${normalizedStatus} by authority ${authorityId}`);
    return updated;
  }
};

export default complaintService;
