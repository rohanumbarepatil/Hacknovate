import api from './api';
import { API_ENDPOINTS } from '@/constants/apiEndpoints';

/**
 * SOS API service
 * Handles emergency SOS alert operations
 */
const sosService = {
  /**
   * Trigger an SOS emergency alert
   */
  async trigger(location, metadata = {}) {
    const res = await api.post(API_ENDPOINTS.SOS.BASE, {
      lat: location.lat,
      lng: location.lng,
      ...metadata,
    });
    return res.data?.data || res.data;
  },

  /**
   * Upload SOS audio file to backend fallback storage
   */
  async uploadAudio(audioBlob, firebaseSosId) {
    const formData = new FormData();
    formData.append('audio', audioBlob, `${firebaseSosId || Date.now()}.webm`);
    if (firebaseSosId) {
      formData.append('firebaseSosId', firebaseSosId);
    }

    const res = await api.post(API_ENDPOINTS.SOS.UPLOAD_AUDIO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });

    return res.data?.data || res.data;
  },

  /**
   * Get all active SOS alerts (authority view)
   */
  async getActive() {
    const res = await api.get(API_ENDPOINTS.SOS.ACTIVE);
    return res.data;
  },

  /**
   * Acknowledge an SOS alert (authority)
   */
  async acknowledge(id) {
    const res = await api.put(API_ENDPOINTS.SOS.ACKNOWLEDGE(id));
    return res.data;
  },

  /**
   * Resolve an SOS alert (authority)
   */
  async resolve(id) {
    const res = await api.put(API_ENDPOINTS.SOS.RESOLVE(id));
    return res.data;
  },
};

export default sosService;
