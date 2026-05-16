import express from 'express';
import { 
  createIncident, 
  getIncidents, 
  getIncidentById, 
  updateIncidentStatus, 
  assignUnit, 
  getMapData 
} from '../controllers/incidentController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

// General routes
router.get('/geojson', getMapData);
router.get('/:id', getIncidentById);

// Citizen routes (reporting)
router.post('/', firebaseAuth, createIncident);

// Authority/Police routes
router.get('/', firebaseAuth, roleGuard(['authority', 'police', 'admin']), getIncidents);
router.patch('/:id/status', firebaseAuth, roleGuard(['authority', 'police', 'admin']), updateIncidentStatus);
router.patch('/:id/assign', firebaseAuth, roleGuard(['authority', 'admin']), assignUnit);

export default router;
