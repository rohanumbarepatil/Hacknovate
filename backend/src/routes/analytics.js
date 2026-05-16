import express from 'express';
import { 
  getDashboardStats, 
  getTrends, 
  getCategoryStats, 
  getZoneComparison, 
  getZoneForecast 
} from '../controllers/analyticsController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

// All analytics require authority/admin role
router.use(firebaseAuth, roleGuard(['authority', 'admin']));

router.get('/stats', getDashboardStats);
router.get('/trends', getTrends);
router.get('/categories', getCategoryStats);
router.get('/zones', getZoneComparison);
router.get('/forecast/:zoneId', getZoneForecast);

export default router;
