import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { Request, Response } from 'express';
import authRoutes from '../src/server/routes/auth';
import portfolioRoutes from '../src/server/routes/portfolio';
import activityLogsRoutes from '../src/server/routes/activityLogs';
import postsRoutes from '../src/server/routes/posts';
import contactRoutes from '../src/server/routes/contact';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

app.use('/api/admin', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/logs', activityLogsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
