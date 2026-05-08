import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';

// Mock bcrypt to avoid actual hashing
vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
  compare: vi.fn(),
}));

// Mock services
vi.mock('../../services/userService', () => ({
  userService: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    getTokenVersion: vi.fn(),
    incrementTokenVersion: vi.fn(),
  },
}));

vi.mock('../../services/refreshTokenService', () => ({
  refreshTokenService: {
    create: vi.fn(),
    verify: vi.fn(),
    rotate: vi.fn(),
    revokeAllForUser: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../config/jwt', () => ({
  generateToken: vi.fn(() => 'mock-jwt-token'),
  verifyToken: vi.fn(),
}));

vi.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    if (req.headers.authorization) {
      req.user = { userId: 'user-123', email: 'admin@test.com', role: 'admin' };
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },
}));

// Import after mocking
import authRouter from '../auth';
import { userService } from '../../services/userService';
import { refreshTokenService } from '../../services/refreshTokenService';
import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/errors';

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', authRouter);
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  );
  return app;
};

const MOCK_USER = {
  id: 'user-123',
  email: 'admin@test.com',
  password_hash: 'hashed-password',
  role: 'admin',
  token_version: 0,
  created_at: '2024-01-01T00:00:00.000Z',
};

describe('Auth Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/login', () => {
    it('returns token, refreshToken and user on valid credentials', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(MOCK_USER);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(userService.getTokenVersion).mockResolvedValue(0);
      vi.mocked(refreshTokenService.create).mockResolvedValue('mock-refresh-token');

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          role: MOCK_USER.role,
        },
      });
    });

    it('returns 401 on invalid email', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'wrong@test.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });

    it('returns 401 on invalid password', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(MOCK_USER);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid credentials' });
    });
  });

  describe('POST /api/admin/refresh', () => {
    it('returns new tokens on valid refresh', async () => {
      vi.mocked(refreshTokenService.verify).mockResolvedValue(true);
      vi.mocked(userService.findById).mockResolvedValue(MOCK_USER);
      vi.mocked(userService.getTokenVersion).mockResolvedValue(0);
      vi.mocked(refreshTokenService.rotate).mockResolvedValue('new-refresh-token');

      const response = await request(app)
        .post('/api/admin/refresh')
        .send({ refreshToken: 'valid-refresh-token', userId: 'user-123' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        token: 'mock-jwt-token',
        refreshToken: 'new-refresh-token',
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          role: MOCK_USER.role,
        },
      });
      expect(refreshTokenService.rotate).toHaveBeenCalledWith('user-123', 'valid-refresh-token');
    });

    it('returns 400 when refreshToken is missing', async () => {
      const response = await request(app).post('/api/admin/refresh').send({ userId: 'user-123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing refreshToken or userId' });
    });

    it('returns 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/admin/refresh')
        .send({ refreshToken: 'valid-token' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Missing refreshToken or userId' });
    });

    it('returns 401 when refresh token is invalid', async () => {
      vi.mocked(refreshTokenService.verify).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/admin/refresh')
        .send({ refreshToken: 'invalid-token', userId: 'user-123' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Invalid or expired refresh token' });
    });

    it('returns 401 when user is not found', async () => {
      vi.mocked(refreshTokenService.verify).mockResolvedValue(true);
      vi.mocked(userService.findById).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/admin/refresh')
        .send({ refreshToken: 'valid-token', userId: 'ghost-user' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'User not found' });
    });
  });

  describe('POST /api/admin/logout', () => {
    it('requires authentication', async () => {
      const response = await request(app).post('/api/admin/logout');

      expect(response.status).toBe(401);
    });

    it('increments token version and revokes refresh tokens', async () => {
      vi.mocked(userService.incrementTokenVersion).mockResolvedValue(undefined);
      vi.mocked(refreshTokenService.revokeAllForUser).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/admin/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
      expect(userService.incrementTokenVersion).toHaveBeenCalledWith('user-123');
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith('user-123');
    });

    it('returns success even when revoke fails', async () => {
      vi.mocked(userService.incrementTokenVersion).mockRejectedValue(new Error('DB error'));
      vi.mocked(refreshTokenService.revokeAllForUser).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/admin/logout')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/admin/me', () => {
    it('returns current user', async () => {
      vi.mocked(userService.findById).mockResolvedValue(MOCK_USER);

      const response = await request(app)
        .get('/api/admin/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        role: MOCK_USER.role,
      });
    });

    it('returns 401 without auth', async () => {
      const response = await request(app).get('/api/admin/me');

      expect(response.status).toBe(401);
    });

    it('returns 404 when user not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/admin/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(userService.findById).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/admin/me')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/admin/login error handling', () => {
    it('returns 500 on unexpected error', async () => {
      vi.mocked(userService.findByEmail).mockRejectedValue(new Error('DB crash'));

      const response = await request(app)
        .post('/api/admin/login')
        .send({ email: 'admin@test.com', password: 'password123' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });
});
