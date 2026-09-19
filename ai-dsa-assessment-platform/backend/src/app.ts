import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter, requestLogger } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import assessmentRoutes from './routes/assessments';
import aiRoutes from './routes/ai';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import adminRoutes from './routes/admin';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [config.clientUrl, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'AI DSA Assessment Platform API', version: '1.0.0' });
});

// Apply global rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

export default app;
