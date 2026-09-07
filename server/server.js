import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import packageRoutes from './routes/packages.js';
import jamaahRoutes from './routes/jamaah.js';
import taskRoutes from './routes/tasks.js';
import financeRoutes from './routes/finance.js';
import visaRoutes from './routes/visa.js';
import notificationRoutes from './routes/notifications.js';
import { readDB } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend & external clients
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Initialize database on server start
readDB();

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'TravelOps Backend API',
    version: '2.5.0-production',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(1)}s`
  });
});

// Mount modular REST routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/jamaah', jamaahRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/notifications', notificationRoutes);

// If production build exists in dist, serve static assets
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  
  // SPA fallback for all non-api routes
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
} else {
  // Fallback 404 for undefined api routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API Route ${req.originalUrl} not found.`
    });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=========================================`);
  console.log(`🚀 TravelOps Backend Server is Running!`);
  console.log(`🌐 Local:   http://localhost:${PORT}`);
  console.log(`📡 Health:  http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
