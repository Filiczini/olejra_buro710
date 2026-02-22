import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import type { Request, Response } from 'express';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import activityLogsRoutes from './routes/activityLogs';
import postsRoutes from './routes/posts';
import contactRoutes from './routes/contact';
import apiPostsRoutes from './routes/api/posts';
import { swaggerSpec } from './docs/swagger';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));

app.use('/api/admin', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/logs', activityLogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

// External API v1
app.use('/api/v1/posts', apiPostsRoutes);

// API Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));

  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
