import sosService from '../services/sosService.js';
import { success } from '../utils/response.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Refactored SOS Controller (Enterprise Grade)
 */

export const triggerSOS = async (req, res, next) => {
  try {
    const {
      lat,
      lng,
      clientTimestamp,
      userName,
      userEmail,
      userPhone,
      firebaseSosId
    } = req.body;
    const userId = req.user.uid;
    const alert = await sosService.triggerSOS(userId, lat, lng, {
      clientTimestamp,
      userName,
      userEmail,
      userPhone,
      firebaseSosId
    });
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

export const uploadSOSAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ValidationError('Audio file is required');
    }

    const baseUrl = process.env.BACKEND_PUBLIC_URL?.replace(/\/+$/, '') || `${req.protocol}://${req.get('host')}`;
    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const publicPath = normalizedPath.includes('uploads/')
      ? normalizedPath.slice(normalizedPath.indexOf('uploads/'))
      : `uploads/sos/${req.file.filename}`;

    res.status(201).json(success({
      audioUrl: `${baseUrl}/${publicPath}`,
      audioPath: publicPath,
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      firebaseSosId: req.body.firebaseSosId || null
    }, 'SOS audio uploaded successfully'));
  } catch (err) {
    next(err);
  }
};
