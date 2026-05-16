import analyticsService from '../services/analyticsService.js';
import { success } from '../utils/response.js';

/**
 * Refactored Analytics Controller (Enterprise Grade)
 */

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
};

export const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const trends = await analyticsService.getTrends(days);
    res.json(success(trends));
  } catch (err) {
    next(err);
  }
};

export const getCategoryStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getCategoryStats();
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
};

export const getZoneComparison = async (req, res, next) => {
  try {
    const comparison = await analyticsService.getZoneComparison();
    res.json(success(comparison));
  } catch (err) {
    next(err);
  }
};

export const getZoneForecast = async (req, res, next) => {
  try {
    const { zoneId } = req.params;
    const forecast = await analyticsService.getZoneForecast(zoneId);
    res.json(success(forecast));
  } catch (err) {
    next(err);
  }
};
