/**
 * Geospatial utility functions
 * Haversine distance calculation and bounding box helpers
 */

/**
 * Calculate the Haversine distance between two lat/lng points
 * @returns Distance in meters
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Create a bounding box around a point with a given radius (in meters)
 * @returns { minLat, maxLat, minLng, maxLng }
 */
export function boundingBox(lat, lng, radiusMeters) {
  const R = 6371000;
  const latDelta = (radiusMeters / R) * (180 / Math.PI);
  const lngDelta = (radiusMeters / (R * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Check if a point is within a bounding box
 */
export function isWithinBounds(lat, lng, bounds) {
  return (
    lat >= bounds.minLat &&
    lat <= bounds.maxLat &&
    lng >= bounds.minLng &&
    lng <= bounds.maxLng
  );
}
