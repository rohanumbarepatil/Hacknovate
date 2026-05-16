/**
 * Map configuration defaults
 * Center: Satara, Maharashtra, India
 */

// Default map center (Satara city)
export const MAP_CENTER = {
  lat: 17.6868,
  lng: 74.0183,
};

// Default zoom levels
export const ZOOM_LEVELS = {
  CITY: 13,
  WARD: 15,
  STREET: 17,
  OVERVIEW: 11,
};

// Google Maps dark mode style array
export const MAP_STYLE_DARK = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8892b0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2d2d44' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a2e' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a55' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a40' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1f1f35' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6c7293' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1f1f35' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#4a4a6a' }] },
];

// Standard light map style
export const MAP_STYLE_LIGHT = [];

// Tactical mode style (high contrast for authority)
export const MAP_STYLE_TACTICAL = [
  { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#58a6ff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#161b22' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1f2937' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#051d36' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// Heatmap gradient colors
export const HEATMAP_GRADIENT = [
  'rgba(0, 255, 0, 0)',
  'rgba(0, 255, 0, 0.4)',
  'rgba(255, 255, 0, 0.6)',
  'rgba(255, 165, 0, 0.8)',
  'rgba(255, 0, 0, 1)',
];

// Layer definitions
export const MAP_LAYERS = {
  CRIME_HEATMAP: 'crime-heatmap',
  ACCIDENT_ZONES: 'accident-zones',
  UNSAFE_ROADS: 'unsafe-roads',
  EMERGENCY_VEHICLES: 'emergency-vehicles',
  INCIDENT_PINS: 'incident-pins',
  RISK_ZONES: 'risk-zones',
};

// Marker colors by incident type
export const INCIDENT_COLORS = {
  crime: '#ef4444',       // Red
  accident: '#f97316',    // Orange
  fire: '#f59e0b',        // Amber
  flood: '#3b82f6',       // Blue
  infrastructure: '#8b5cf6', // Purple
  medical: '#ec4899',     // Pink
  other: '#6b7280',       // Gray
};

// Severity color scale
export const SEVERITY_COLORS = {
  1: '#22c55e',  // Green (low)
  2: '#22c55e',
  3: '#84cc16',
  4: '#eab308',  // Yellow (medium)
  5: '#eab308',
  6: '#f97316',
  7: '#f97316',  // Orange (high)
  8: '#ef4444',
  9: '#ef4444',  // Red (critical)
  10: '#dc2626',
};

// Google Maps API libraries to load
export const GOOGLE_MAPS_LIBRARIES = ['places', 'visualization', 'geometry'];
