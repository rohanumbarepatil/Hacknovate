/**
 * Backend constants — Statuses
 * Must match frontend constants/roles.js
 */

export const INCIDENT_STATUS = {
  REPORTED: 'reported',
  VERIFIED: 'verified',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  FALSE_ALARM: 'false_alarm',
};

export const COMPLAINT_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

export const SOS_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESPONDING: 'responding',
  RESOLVED: 'resolved',
  FALSE_ALARM: 'false_alarm',
};

export const UNIT_STATUS = {
  AVAILABLE: 'available',
  DISPATCHED: 'dispatched',
  EN_ROUTE: 'en_route',
  ON_SCENE: 'on_scene',
  RETURNING: 'returning',
  OFFLINE: 'offline',
};
