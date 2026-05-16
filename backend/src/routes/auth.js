import express from 'express';
import { syncUser, getProfile, updateProfile } from '../controllers/authController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

router.post('/sync', firebaseAuth, syncUser);
router.get('/profile', firebaseAuth, getProfile);
router.patch('/profile', firebaseAuth, updateProfile);

export default router;
