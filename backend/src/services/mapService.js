import zoneQueries from '../database/queries/zoneQueries.js';

/**
 * Map Service - Provides GIS data for map rendering.
 */
const mapService = {
  async getBoundaries() {
    const zones = await zoneQueries.getAll();
    return zones.map(z => ({
      id: z.id,
      name: z.name,
      ward_number: z.ward_number,
      geojson: z.boundary_geojson
    }));
  },

  async getRiskMap() {
    return await zoneQueries.getRiskScores();
  },

  async getUnsafeRoads() {
    return await zoneQueries.getUnsafeRoads();
  },

  async findZone(lat, lng) {
    return await zoneQueries.findZoneByPoint(lat, lng);
  }
};

export default mapService;
