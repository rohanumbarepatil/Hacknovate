import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * Complaint API service
 * All complaint-related HTTP calls go through here
 */
const complaintService = {
  /**
   * Create a new complaint (with optional photo upload)
   */
  async create(complaintData, photoFile = null) {
    const formData = new FormData();
    formData.append('category', complaintData.category);
    formData.append('description', complaintData.description);
    formData.append('lat', complaintData.location.lat);
    formData.append('lng', complaintData.location.lng);
    if (complaintData.address) formData.append('address', complaintData.address);
    if (photoFile) formData.append('photo', photoFile);

    const res = await api.post(API_ENDPOINTS.COMPLAINTS.BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /**
   * Get paginated list of complaints with filters
   */
  async getAll(params = {}) {
    const res = await api.get(API_ENDPOINTS.COMPLAINTS.BASE, { params });
    return res.data;
  },

  /**
   * Get a single complaint by ID
   */
  async getById(id) {
    const res = await api.get(API_ENDPOINTS.COMPLAINTS.BY_ID(id));
    return res.data;
  },

  /**
   * Get current user's complaints
   */
  async getMine() {
    const res = await api.get(API_ENDPOINTS.COMPLAINTS.MY);
    return res.data;
  },

  /**
   * Update complaint status (authority only)
   */
  async updateStatus(id, statusPayload) {
    const body = typeof statusPayload === 'string' ? { status: statusPayload } : statusPayload;
    const res = await api.put(API_ENDPOINTS.COMPLAINTS.STATUS(id), body);
    return res.data;
  },
};

export default complaintService;
