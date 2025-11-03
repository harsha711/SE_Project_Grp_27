import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import env from './config/env.js';
import routes from './routes/index.js';

const app = express();

// Global middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Session middleware
app.use(session({
  secret: env.session.secret,
  name: env.session.name,
  resave: false,
  saveUninitialized: true, // Create session even if not modified (needed for cart)
  store: MongoStore.create({
    mongoUrl: env.mongodbUri,
    touchAfter: 24 * 3600, // lazy session update (in seconds)
    crypto: {
      secret: env.session.secret
    }
  }),
  cookie: {
    maxAge: env.session.maxAge,
    httpOnly: true,
    secure: env.nodeEnv === 'production', // Use secure cookies in production
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  }
}));

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
