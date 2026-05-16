import mapService from '../services/mapService.js';
import { success } from '../utils/response.js';

/**
 * Refactored Zone/GIS Controller (Enterprise Grade)
 */

export const getBoundaries = async (req, res, next) => {
  try {
    const boundaries = await mapService.getBoundaries();
    res.json(success(boundaries));
  } catch (err) {
    next(err);
  }
};

export const getRiskMap = async (req, res, next) => {
  try {
    const riskMap = await mapService.getRiskMap();
    res.json(success(riskMap));
  } catch (err) {
    next(err);
  }
};

export const getUnsafeRoads = async (req, res, next) => {
  try {
    const roads = await mapService.getUnsafeRoads();
    res.json(success(roads));
  } catch (err) {
    next(err);
  }
};

export const findZone = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const zone = await mapService.findZone(parseFloat(lat), parseFloat(lng));
    res.json(success(zone));
  } catch (err) {
    next(err);
  }
};
