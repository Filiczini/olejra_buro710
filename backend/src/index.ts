import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import type { Request, Response } from 'express';
import { env } from './config/env';
import { logger } from './lib/logger';
import { requestIdMiddleware } from './middleware/requestId';
import authRoutes from './routes/auth';
import activityLogsRoutes from './routes/activityLogs';
import postsRoutes from './routes/posts';
import contactRoutes from './routes/contact';
import apiPostsRoutes from './routes/api/posts';
import { supabase } from './config/supabase';
import { swaggerSpec } from './docs/swagger';

const app = express();
const PORT = env.PORT;

app.use(requestIdMiddleware);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
      },
    },
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

app.use('/api/admin', authRoutes);
app.use('/api/logs', activityLogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

// External API v1
app.use('/api/v1/posts', apiPostsRoutes);

// API Documentation
app.get('/api/docs', (_req: Request, res: Response) => {
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
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Healthcheck endpoints
app.get('/ping', (_req: Request, res: Response) => {
  res.send('pong');
});

app.get('/health', async (_req: Request, res: Response) => {
  try {
    const { error } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    if (error) throw error;
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

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
