import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { 
  triggerSOS, 
  uploadSOSAudio,
  getActiveAlerts, 
  acknowledgeAlert, 
  resolveAlert 
} from '../controllers/sosController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sosUploadsDir = path.resolve(__dirname, '../../uploads/sos');

fs.mkdirSync(sosUploadsDir, { recursive: true });

const audioUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, sosUploadsDir),
    filename: (req, file, cb) => {
      const mimeExtensionMap = {
        'audio/webm': '.webm',
        'audio/mpeg': '.mp3',
        'audio/mp3': '.mp3',
        'audio/wav': '.wav',
        'audio/x-wav': '.wav',
        'audio/ogg': '.ogg',
        'audio/mp4': '.m4a'
      };
      const ext = mimeExtensionMap[file.mimetype] || '.webm';
      const alertKey = req.body.firebaseSosId || 'sos';
      cb(null, `${alertKey}-${Date.now()}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith('audio/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only audio files are allowed'));
  },
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

// Citizen route
router.post('/', firebaseAuth, triggerSOS);
router.post('/upload-audio', firebaseAuth, audioUpload.single('audio'), uploadSOSAudio);

// Authority/Police routes
router.get('/active', firebaseAuth, roleGuard(['authority', 'police', 'admin']), getActiveAlerts);
router.patch('/:id/acknowledge', firebaseAuth, roleGuard(['authority', 'police', 'admin']), acknowledgeAlert);
router.patch('/:id/resolve', firebaseAuth, roleGuard(['authority', 'admin']), resolveAlert);

export default router;
