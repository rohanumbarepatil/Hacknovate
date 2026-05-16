import express from 'express';
import { 
  createComplaint, 
  getComplaints, 
  getMyComplaints, 
  updateComplaintStatus 
} from '../controllers/complaintController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

// Citizen routes
router.post('/', firebaseAuth, createComplaint);
router.get('/my', firebaseAuth, getMyComplaints);

// Authority routes
router.get('/', firebaseAuth, roleGuard(['authority', 'admin']), getComplaints);
router.patch('/:id/status', firebaseAuth, roleGuard(['authority', 'admin']), updateComplaintStatus);

export default router;
