import sosQueries from '../database/queries/sosQueries.js';
import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { io } from '../app.js';

/**
 * SOS Service - Handles emergency SOS alerts and real-time broadcasting.
 */
const sosService = {
  async triggerSOS(userId, lat, lng) {
    const alert = await sosQueries.create({ citizenId: userId, lat, lng });
    
    logger.error(`🚨 SOS ALERT TRIGGERED by user ${userId} at ${lat}, ${lng}`);

    // Broadcast to all authorities via Socket.io
    if (io) {
      io.to('authority_room').emit(SOCKET_EVENTS.SOS_NEW, alert);
      io.to('police_room').emit(SOCKET_EVENTS.SOS_NEW, alert);
    }

    return alert;
  },

  async getActiveAlerts() {
    return await sosQueries.getActive();
  },

  async acknowledgeAlert(id, responderId) {
    const updated = await sosQueries.acknowledge(id, responderId);
    
    if (io) {
      io.emit(SOCKET_EVENTS.SOS_ACKNOWLEDGED, { id, status: 'acknowledged' });
    }
    
    return updated;
  },

  async resolveAlert(id, status) {
    const updated = await sosQueries.resolve(id, status);
    
    if (io) {
      io.emit(SOCKET_EVENTS.SOS_RESOLVED, { id, status: updated.status });
    }
    
    return updated;
  }
};

export default sosService;
