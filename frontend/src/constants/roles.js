/**
 * User role constants
 * Used for role-based access control in routing and UI
 */

export const ROLES = {
  CITIZEN: 'citizen',
  AUTHORITY: 'authority',
  POLICE: 'police',
  ADMIN: 'admin',
};

/**
 * Status constants for incidents and complaints
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

export const URGENCY_LABELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

/**
 * Complaint categories
 */
export const COMPLAINT_CATEGORIES = [
  { value: 'road_damage', label: 'Road Damage', icon: '🛣️' },
  { value: 'street_light', label: 'Street Light', icon: '💡' },
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'sanitation', label: 'Sanitation', icon: '🗑️' },
  { value: 'traffic', label: 'Traffic', icon: '🚦' },
  { value: 'harassment', label: 'Harassment', icon: '⚠️' },
  { value: 'noise', label: 'Noise Pollution', icon: '🔊' },
  { value: 'encroachment', label: 'Encroachment', icon: '🏗️' },
  { value: 'other', label: 'Other', icon: '📝' },
];

/**
 * Incident types
 */
export const INCIDENT_TYPES = [
  { value: 'crime', label: 'Crime', icon: '🚔', color: '#ef4444' },
  { value: 'accident', label: 'Accident', icon: '🚗', color: '#f97316' },
  { value: 'fire', label: 'Fire', icon: '🔥', color: '#f59e0b' },
  { value: 'flood', label: 'Flood', icon: '🌊', color: '#3b82f6' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', color: '#8b5cf6' },
  { value: 'medical', label: 'Medical', icon: '🏥', color: '#ec4899' },
  { value: 'other', label: 'Other', icon: '📋', color: '#6b7280' },
];

/**
 * Emergency unit types
 */
export const UNIT_TYPES = [
  { value: 'police', label: 'Police', icon: '🚔' },
  { value: 'ambulance', label: 'Ambulance', icon: '🚑' },
  { value: 'fire', label: 'Fire Brigade', icon: '🚒' },
  { value: 'rescue', label: 'Rescue', icon: '🆘' },
];
