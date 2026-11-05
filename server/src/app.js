import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { donationRouter } from './routes/donationRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import { paymentRouter } from './routes/paymentRoutes.js';
import { integrationRouter } from './routes/integrationRoutes.js';
import { adminRouter } from './routes/adminRoutes.js';
import { ngoRouter } from './routes/ngoRoutes.js';
import { communicationRouter } from './routes/communicationRoutes.js';

export const app = express();

// Security Headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Food Punarvitaran API operational',
    timestamp: new Date().toISOString(),
    region: 'Bengaluru, India'
  });
});

// Mount Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/donations', donationRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/integrations', integrationRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/ngo', ngoRouter);
app.use('/api/v1/comm', communicationRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});
