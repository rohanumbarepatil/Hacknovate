import sosService from '../services/sosService.js';
import { success } from '../utils/response.js';

/**
 * Refactored SOS Controller (Enterprise Grade)
 */

export const triggerSOS = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.uid;
    const alert = await sosService.triggerSOS(userId, lat, lng);
    res.status(201).json(success(alert, 'SOS Alert triggered and broadcasted'));
  } catch (err) {
    next(err);
  }
};

export const getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await sosService.getActiveAlerts();
    res.json(success(alerts));
  } catch (err) {
    next(err);
  }
};

export const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const responderId = req.user.uid; // Mock responder or join with unit
    const updated = await sosService.acknowledgeAlert(id, responderId);
    res.json(success(updated, 'SOS Alert acknowledged'));
  } catch (err) {
    next(err);
  }
};

export const resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await sosService.resolveAlert(id, status);
    res.json(success(updated, 'SOS Alert resolved'));
  } catch (err) {
    next(err);
  }
};
