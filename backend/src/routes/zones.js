import express from 'express';
import { 
  getBoundaries, 
  getRiskMap, 
  getUnsafeRoads, 
  findZone 
} from '../controllers/zoneController.js';

const router = express.Router();

router.get('/boundaries', getBoundaries);
router.get('/risk-map', getRiskMap);
router.get('/unsafe-roads', getUnsafeRoads);
router.get('/lookup', findZone);

export default router;
