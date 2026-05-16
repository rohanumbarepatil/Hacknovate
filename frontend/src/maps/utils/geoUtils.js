/**
 * Map utility functions
 * Geospatial calculations for frontend use
 */

/**
 * Calculate distance between two points in meters (Haversine)
 */
export function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format distance for display
 */
export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Check if a point is within the current map bounds
 */
export function isInBounds(lat, lng, bounds) {
  return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
}

/**
 * Get bounds that fit all given points with padding
 */
export function fitBounds(map, points, padding = 50) {
  if (!map || !window.google || !points.length) return;
  const bounds = new window.google.maps.LatLngBounds();
  points.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
  map.fitBounds(bounds, padding);
}
