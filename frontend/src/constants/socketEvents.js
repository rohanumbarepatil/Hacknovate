/**
 * Socket.io event name constants
 * Must match backend socket event names exactly
 */

export const SOCKET_EVENTS = {
  // Incident events
  INCIDENT_NEW: 'incident:new',
  INCIDENT_UPDATE: 'incident:update',

  // SOS events
  SOS_NEW: 'sos:new',
  SOS_ALERT: 'sos:alert',
  SOS_ACKNOWLEDGED: 'sos:acknowledged',
  SOS_RESOLVED: 'sos:resolved',

  // Complaint events
  COMPLAINT_NEW: 'complaint:new',
  COMPLAINT_STATUS: 'complaint:status',

  // Vehicle tracking events
  VEHICLE_POSITION: 'vehicle:position',
  VEHICLE_BROADCAST: 'vehicle:broadcast',
  VEHICLE_UPDATED: 'vehicle:updated',

  // Risk events
  RISK_UPDATED: 'risk:updated',

  // Analytics events
  ANALYTICS_REFRESH: 'analytics:refresh',

  // Map events
  MAP_LAYER_UPDATE: 'map:layer-update',

  // Room events
  JOIN_ROOM: 'join:room',
  LEAVE_ROOM: 'leave:room',

  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
};

export default SOCKET_EVENTS;
