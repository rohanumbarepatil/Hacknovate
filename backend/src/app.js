import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { setupSocketHandlers } from './socket/socketHandlers.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io initialization
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Global logger for requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Socket.io setup
setupSocketHandlers(io);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import incidentsRouter from './routes/incidents.js';
import complaintsRouter from './routes/complaints.js';
import sosRouter from './routes/sos.js';
import zonesRouter from './routes/zones.js';
import analyticsRouter from './routes/analytics.js';
import authRouter from './routes/auth.js';

app.use('/api/incidents', incidentsRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/sos', sosRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', authRouter);

app.get('/api', (req, res) => {
  res.json({ 
    message: 'SafeCity API v1.0', 
    status: 'operational',
    documentation: '/api-docs'
  });
});

// Error handling (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.success(`🚀 SafeCity Backend running on port ${PORT}`);
  logger.socket(`📡 Socket.io ready for real-time connections`);
});

export { io };
export default app;
