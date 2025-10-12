import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// API routes
app.use('/api', routes);

// Health check fallback for root requests
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Food Delivery API is running',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Resource not found',
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

export default app;
