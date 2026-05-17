import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { 
  createComplaint, 
  getComplaints, 
  getMyComplaints, 
  updateComplaintStatus,
  getComplaintById
} from '../controllers/complaintController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const complaintsUploadsDir = path.resolve(__dirname, '../../uploads/complaints');

// Ensure secure complaints upload folder exists
fs.mkdirSync(complaintsUploadsDir, { recursive: true });

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, complaintsUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `complaint-${uniqueSuffix}${ext}`);
  }
});

// Image File Validation Filter
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image type. Supported: JPG, JPEG, PNG, WEBP'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Citizen routes
router.post('/', firebaseAuth, upload.single('photo'), createComplaint);
router.post('/create', firebaseAuth, upload.single('photo'), createComplaint);
router.get('/my', firebaseAuth, getMyComplaints);
router.get('/:id', firebaseAuth, getComplaintById);

// Authority routes
router.get('/', firebaseAuth, roleGuard(['authority', 'admin']), getComplaints);
router.get('/all', firebaseAuth, roleGuard(['authority', 'admin']), getComplaints);
router.patch('/status', firebaseAuth, roleGuard(['authority', 'admin']), updateComplaintStatus);
router.patch('/:id/status', firebaseAuth, roleGuard(['authority', 'admin']), updateComplaintStatus);
router.put('/:id/status', firebaseAuth, roleGuard(['authority', 'admin']), updateComplaintStatus);

export default router;
