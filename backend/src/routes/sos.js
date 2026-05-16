import express from 'express';
import { 
  triggerSOS, 
  getActiveAlerts, 
  acknowledgeAlert, 
  resolveAlert 
} from '../controllers/sosController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

// Citizen route
router.post('/', firebaseAuth, triggerSOS);

// Authority/Police routes
router.get('/active', firebaseAuth, roleGuard(['authority', 'police', 'admin']), getActiveAlerts);
router.patch('/:id/acknowledge', firebaseAuth, roleGuard(['authority', 'police', 'admin']), acknowledgeAlert);
router.patch('/:id/resolve', firebaseAuth, roleGuard(['authority', 'admin']), resolveAlert);

export default router;
