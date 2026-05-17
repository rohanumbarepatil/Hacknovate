import sosQueries from '../database/queries/sosQueries.js';
import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { io } from '../app.js';

/**
 * SOS Service - Handles emergency SOS alerts and real-time broadcasting.
 */
const sosService = {
  async triggerSOS(userId, lat, lng, metadata = {}) {
    let alert = null;
    try {
      alert = await sosQueries.create({ citizenId: userId, lat, lng });
    } catch (err) {
      logger.warn(`Failed to persist SOS alert in SQL: ${err.message}`);
    }

    const timestamp = metadata.clientTimestamp || Date.now();
    const payload = {
      id: alert?.id || metadata.firebaseSosId || `sos_${timestamp}`,
      userId,
      lat: alert?.lat ?? lat ?? null,
      lng: alert?.lng ?? lng ?? null,
      status: alert?.status || 'active',
      timestamp,
      created_at: alert?.created_at || new Date(timestamp).toISOString(),
      citizen_name: metadata.userName || alert?.citizen_name || null,
      citizen_email: metadata.userEmail || null,
      citizen_phone: metadata.userPhone || alert?.citizen_phone || null,
      firebase_sos_id: metadata.firebaseSosId || null,
    };

    logger.error(`SOS ALERT TRIGGERED by user ${userId} at ${payload.lat}, ${payload.lng}`);

    // Broadcast to all listeners and authority/police rooms
    if (io) {
      io.to('authority_room').emit(SOCKET_EVENTS.SOS_NEW, payload);
      io.to('police_room').emit(SOCKET_EVENTS.SOS_NEW, payload);
      io.emit(SOCKET_EVENTS.SOS_NEW, payload);
      io.emit(SOCKET_EVENTS.SOS_ALERT, payload);
    }

    return payload;
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
  },
};

export default sosService;
