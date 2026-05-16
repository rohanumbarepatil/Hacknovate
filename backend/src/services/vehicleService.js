import vehicleQueries from '../database/queries/vehicleQueries.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import { io } from '../app.js';
import logger from '../utils/logger.js';

/**
 * Vehicle Service - Manages emergency units and their real-time positions.
 */
const vehicleService = {
  async getVehicles() {
    return await vehicleQueries.getAll();
  },

  async updatePosition(id, lat, lng, speed, heading) {
    const updated = await vehicleQueries.updatePosition(id, lat, lng, speed, heading);
    
    // Broadcast updated position to all clients
    if (io) {
      io.emit(SOCKET_EVENTS.VEHICLE_UPDATED, {
        vehicleId: id,
        lat,
        lng,
        speed,
        heading,
        lastUpdated: updated.last_ping
      });
    }
    
    return updated;
  },

  async updateStatus(id, status) {
    const updated = await vehicleQueries.updateStatus(id, status);
    
    if (io) {
      io.emit(SOCKET_EVENTS.VEHICLE_UPDATED, { vehicleId: id, status });
    }
    
    return updated;
  }
};

export default vehicleService;
