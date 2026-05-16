import express from 'express';
import { 
  getDashboardStats, 
  getTrends, 
  getCategoryStats, 
  getZoneComparison, 
  getZoneForecast,
  getLiveFeed
} from '../controllers/analyticsController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/trends', getTrends);
router.get('/categories', getCategoryStats);
router.get('/zones', getZoneComparison);
router.get('/feed', getLiveFeed);
router.get('/forecast/:zoneId', firebaseAuth, roleGuard(['authority', 'admin']), getZoneForecast);

export default router;
