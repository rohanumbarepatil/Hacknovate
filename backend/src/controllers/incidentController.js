import incidentService from '../services/incidentService.js';
import { success } from '../utils/response.js';

/**
 * Refactored Incident Controller (Enterprise Grade)
 */

export const createIncident = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const incident = await incidentService.createIncident(req.body, userId);
    res.status(201).json(success(incident, 'Incident reported successfully'));
  } catch (err) {
    next(err);
  }
};

export const getIncidents = async (req, res, next) => {
  try {
    const incidents = await incidentService.getIncidents(req.query);
    res.json(success(incidents));
  } catch (err) {
    next(err);
  }
};

export const getIncidentById = async (req, res, next) => {
  try {
    const incident = await incidentService.getIncidentById(req.params.id);
    res.json(success(incident));
  } catch (err) {
    next(err);
  }
};

export const updateIncidentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await incidentService.updateIncidentStatus(id, status);
    res.json(success(updated, 'Incident status updated'));
  } catch (err) {
    next(err);
  }
};

export const assignUnit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { unitId } = req.body;
    const updated = await incidentService.assignUnit(id, unitId);
    res.json(success(updated, 'Unit assigned to incident'));
  } catch (err) {
    next(err);
  }
};

export const getMapData = async (req, res, next) => {
  try {
    const data = await incidentService.getMapData();
    res.json(success(data));
  } catch (err) {
    next(err);
  }
};
