import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import identityRoutes from './routes/identity.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Bitespeed Identity Reconciliation Service',
    version: '1.0.0',
    endpoints: {
      frontend: '/',
      identify: 'POST /identify',
      health: 'GET /health',
    },
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'success',
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/', identityRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
