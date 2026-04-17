/**
 * VidCraft AI - Express Server Entry Point
 * Main application setup with middleware and route registration
 */

import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimit';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import videoRoutes from './routes/videos';
import templateRoutes from './routes/templates';

const app = express();

// ==================== Global Middleware ====================

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// ==================== Health Check ====================

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// ==================== API Routes ====================

const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/scripts`, aiRoutes);
app.use(`${API_PREFIX}/videos`, videoRoutes);
app.use(`${API_PREFIX}/templates`, templateRoutes);

// ==================== 404 Handler ====================

app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null,
    timestamp: Date.now(),
  });
});

// ==================== Error Handler ====================

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const statusCode = 500;
    const message =
      env.NODE_ENV === 'production'
        ? '服务器内部错误'
        : err.message || '服务器内部错误';

    res.status(statusCode).json({
      code: statusCode,
      message,
      data: null,
      timestamp: Date.now(),
    });
  }
);

// ==================== Start Server ====================

app.listen(env.PORT, () => {
  process.stdout.write(`
╔══════════════════════════════════════════════╗
║         VidCraft AI Backend Server           ║
╠══════════════════════════════════════════════╣
║  Port:        ${String(env.PORT).padEnd(30)}║
║  Environment: ${env.NODE_ENV.padEnd(30)}║
║  API Prefix:  ${API_PREFIX.padEnd(30)}║
║  CORS:        ${env.CORS_ORIGINS.slice(0, 30).padEnd(30)}║
║  Gemini:      ${(env.GEMINI_API_KEY ? 'Configured' : 'Not configured').padEnd(30)}║
╚══════════════════════════════════════════════╝
`);
});

export default app;
