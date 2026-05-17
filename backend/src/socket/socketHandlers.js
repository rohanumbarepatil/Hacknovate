import logger from '../utils/logger.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import vehicleService from '../services/vehicleService.js';

/**
 * Socket.io Handlers - Orchestrates real-time events.
 */
export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.socket(`New client connected: ${socket.id}`);

    // Join rooms based on role
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room) => {
      socket.join(room);
      logger.socket(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room) => {
      socket.leave(room);
      logger.socket(`Socket ${socket.id} left room: ${room}`);
    });

    // Real-time Vehicle Updates (from units)
    socket.on(SOCKET_EVENTS.VEHICLE_POSITION, async (data) => {
      const { vehicleId, lat, lng, speed, heading } = data;
      try {
        await vehicleService.updatePosition(vehicleId, lat, lng, speed, heading);
        // Position update is broadcasted inside the service
      } catch (err) {
        logger.error(`Failed to update vehicle position: ${err.message}`);
      }
    });

    // Handle SOS alerts triggered via socket (optional fallback)
    socket.on(SOCKET_EVENTS.SOS_ALERT, (data) => {
      logger.error(`Socket SOS alert: ${JSON.stringify(data)}`);
      // Re-broadcast to authority room
      socket.to('authority_room').emit(SOCKET_EVENTS.SOS_NEW, data);
      socket.to('police_room').emit(SOCKET_EVENTS.SOS_NEW, data);
      socket.broadcast.emit(SOCKET_EVENTS.SOS_ALERT, data);
    });

    // Handle citizen SOS real-time events
    socket.on('citizen_sos', (data) => {
      logger.socket(`🚨 Real-time SOS Alert received on Socket: ${JSON.stringify(data)}`);
      // Broadcast immediately to all connected clients (including Authority Command Centers)
      io.emit('authority_receive_sos', data);
      
      // Also broadcast to existing rooms for backward compatibility
      socket.to('authority_room').emit(SOCKET_EVENTS.SOS_NEW, data);
      socket.to('police_room').emit(SOCKET_EVENTS.SOS_NEW, data);
      socket.broadcast.emit(SOCKET_EVENTS.SOS_ALERT, data);
    });

    // Handle citizen real-time complaint submissions
    socket.on('new_complaint', (data) => {
      logger.socket(`📝 New Complaint submitted: ${data.id || 'Unknown ID'} in area: ${data.area || 'Unknown Area'}`);
      // Broadcast instantly to all authority dashboards
      io.emit('authority_new_complaint', data);
      io.emit(SOCKET_EVENTS.COMPLAINT_NEW, data);
    });

    socket.on('disconnect', () => {
      logger.socket(`Client disconnected: ${socket.id}`);
    });
  });
}
