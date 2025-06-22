import express from 'express';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { BikeLaneController } from './controllers/bikeLaneController';
import { AppConfig } from './types';

// Load environment variables
dotenv.config();

// Configuration
const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  moondreamApiKey: process.env.MOONDREAM_API_KEY || '',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
};

// Validate required configuration
if (!config.moondreamApiKey) {
  console.error('Error: MOONDREAM_API_KEY environment variable is required');
  process.exit(1);
}

// Initialize controller
const bikeLaneController = new BikeLaneController();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware - Allow requests from any origin during development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://localhost'] // Replace with your production domain
    : '*', // Allow any origin in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'));
    }
  }
});

// Routes
app.get('/api/health', (req, res) => bikeLaneController.healthCheck(req, res));

// Bike Lane Detection
app.post('/api/detect-bike-lane-violations', 
  upload.single('image'), 
  (req, res) => bikeLaneController.detectBikeLaneViolations(req, res)
);

// NYC Traffic Camera routes
app.get('/api/cameras', (req, res) => bikeLaneController.getTrafficCameras(req, res));
app.get('/api/cameras/:id/feed', (req, res) => bikeLaneController.getCameraFeed(req, res));

// Violation routes
app.get('/api/violations', (req, res) => bikeLaneController.getViolations(req, res));
app.get('/api/violations/:id', (req, res) => bikeLaneController.getViolationById(req, res));
app.post('/api/violations/:id/status', (req, res) => bikeLaneController.updateViolationStatus(req, res));

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Please upload an image smaller than 10MB.'
      });
    }
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚴 Bike Lane Sentinel API running on port ${config.port}`);
  console.log(`📊 Health check: http://localhost:${config.port}/api/health`);
  console.log(`🔍 Detection endpoint: http://localhost:${config.port}/api/detect-bike-lane-violations`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
}); 