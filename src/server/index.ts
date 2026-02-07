import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import authRoutes from './routes/auth';
import portfolioRoutes from './routes/portfolio';
import siteSettingsRoutes from './routes/siteSettings';
import { validateEnv } from './config/env-validation';

// Validate environment before starting server
validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin"
  },
  // Note: TypeScript types for helmet v7.2.0 don't include permissionsPolicy
  // but the actual package supports it. This configuration is correct.
  // @ts-expect-error - permissionsPolicy not in type definitions but supported by helmet
  permissionsPolicy: {
    features: {
      geolocation: ["'self'"],
      microphone: ["'none'"],
      camera: ["'none'"]
    }
  }
}));

// Parse allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173'];

// Configure CORS with origin whitelist
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      // Return exact origin when credentials are enabled
      return callback(null, origin);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure rate limiting for login endpoint (strict)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 attempts per window (v7.x uses 'limit' instead of 'max')
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure rate limiting for API endpoints (standard)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // 100 requests per minute (v7.x uses 'limit' instead of 'max')
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '50mb' }));

// Apply rate limiting
app.post('/api/admin/login', loginLimiter); // Strict limit for login (before routes)
app.use(apiLimiter); // Standard limit for all other routes

app.use('/api/admin', authRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/settings', siteSettingsRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
