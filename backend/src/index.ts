import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs/promises';
import type { Request, Response, NextFunction } from 'express';
import { env } from './config/env';
import { logger } from './lib/logger';
import { AppError } from './lib/errors';
import { requestIdMiddleware } from './middleware/requestId';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import activityLogsRoutes from './routes/activityLogs';
import postsRoutes from './routes/posts';
import contactRoutes from './routes/contact';
import apiPostsRoutes from './routes/api/posts';
import { db } from './db';
import { sql } from 'drizzle-orm';
import { swaggerSpec } from './docs/swagger';

const app = express();
const PORT = env.PORT;

app.set('trust proxy', 1);
app.use(requestIdMiddleware);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Serve uploaded files
app.use('/uploads', express.static(env.UPLOADS_DIR));
logger.info(`Serving uploads from: ${env.UPLOADS_DIR}`);

// Verify uploads directory exists on startup
(async () => {
  try {
    await fs.access(env.UPLOADS_DIR);
    logger.info(`Uploads directory verified: ${env.UPLOADS_DIR}`);
  } catch {
    logger.warn(`Uploads directory does not exist: ${env.UPLOADS_DIR}`);
    logger.warn(
      'Images uploaded to this instance will not be accessible until the directory is created.'
    );
  }
})();

app.use('/api/admin', authRoutes);
app.use('/api/admin', usersRoutes);
app.use('/api/logs', activityLogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

// External API v1
app.use('/api/v1/posts', apiPostsRoutes);

// API Documentation — separate CSP for Swagger UI, protected in production
const docsMiddleware: ((req: Request, res: Response, next: NextFunction) => void)[] = [];

if (process.env.NODE_ENV === 'production') {
  docsMiddleware.push(authMiddleware);
}

const swaggerCsp = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
  },
});

app.get('/api/docs', ...docsMiddleware, swaggerCsp, (_req: Request, res: Response) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Buro 710 API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(swaggerSpec)};
      SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    }
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});
app.get('/api/docs.json', ...docsMiddleware, (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Healthcheck endpoints with rate limiting
const healthRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

app.get('/ping', healthRateLimiter, (_req: Request, res: Response) => {
  res.send('pong');
});

app.get('/health', healthRateLimiter, async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', timestamp: new Date().toISOString() });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handler — must be after all routes
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Multer file size error
  if (err.message?.includes('File too large')) {
    res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
    return;
  }

  // Multer file type error
  if (err.message?.includes('Only JPEG and PNG')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
