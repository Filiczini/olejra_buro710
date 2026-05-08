import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';

vi.mock('../../middleware/auth', () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.user = { userId: 'admin-123', email: 'admin@test.com', role: 'admin' };
    next();
  },
  adminMiddleware: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../services/userService', () => ({
  userService: {
    findAll: vi.fn(),
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock('../../services/refreshTokenService', () => ({
  refreshTokenService: {
    revokeAllForUser: vi.fn(),
  },
}));

vi.mock('../../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
  hash: vi.fn(),
}));

import usersRouter from '../users';
import { userService } from '../../services/userService';
import { refreshTokenService } from '../../services/refreshTokenService';
import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/errors';

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', usersRouter);
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

describe('Users Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('returns list of users', async () => {
      vi.mocked(userService.findAll).mockResolvedValue([
        { id: '1', email: 'a@test.com', role: 'admin', created_at: '2024-01-01T00:00:00.000Z' },
      ] as any);

      const response = await request(app).get('/api/admin/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(userService.findAll).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/admin/users');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/users', () => {
    it('creates a new user', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashed-pass' as any);
      vi.mocked(userService.create).mockResolvedValue({
        id: 'new-id',
        email: 'new@test.com',
        role: 'editor',
        created_at: '2024-01-01T00:00:00.000Z',
      } as any);

      const response = await request(app).post('/api/admin/users').send({
        email: 'new@test.com',
        password: 'password123',
        role: 'editor',
      });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe('new@test.com');
    });

    it('returns 409 when email already exists', async () => {
      vi.mocked(userService.findByEmail).mockResolvedValue({ id: '1' } as any);

      const response = await request(app).post('/api/admin/users').send({
        email: 'existing@test.com',
        password: 'password123',
        role: 'editor',
      });

      expect(response.status).toBe(409);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(userService.findByEmail).mockRejectedValue(new Error('DB error'));

      const response = await request(app).post('/api/admin/users').send({
        email: 'x@test.com',
        password: 'password123',
        role: 'editor',
      });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('deletes a user', async () => {
      vi.mocked(userService.findById).mockResolvedValue({ id: '2' } as any);
      vi.mocked(userService.delete).mockResolvedValue(undefined);
      vi.mocked(refreshTokenService.revokeAllForUser).mockResolvedValue(undefined);

      const response = await request(app).delete('/api/admin/users/2');

      expect(response.status).toBe(200);
      expect(userService.delete).toHaveBeenCalledWith('2');
      expect(refreshTokenService.revokeAllForUser).toHaveBeenCalledWith('2');
    });

    it('returns 400 when deleting self', async () => {
      const response = await request(app).delete('/api/admin/users/admin-123');

      expect(response.status).toBe(400);
    });

    it('returns 404 when user not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null);

      const response = await request(app).delete('/api/admin/users/999');

      expect(response.status).toBe(404);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(userService.findById).mockRejectedValue(new Error('DB error'));

      const response = await request(app).delete('/api/admin/users/2');

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/users/:id/password', () => {
    it('updates password', async () => {
      vi.mocked(userService.findById).mockResolvedValue({ id: '2' } as any);
      vi.mocked(bcrypt.hash).mockResolvedValue('new-hash' as any);
      vi.mocked(userService.updatePassword).mockResolvedValue(undefined);
      vi.mocked(refreshTokenService.revokeAllForUser).mockResolvedValue(undefined);

      const response = await request(app)
        .patch('/api/admin/users/2/password')
        .send({ password: 'newpass123' });

      expect(response.status).toBe(200);
      expect(userService.updatePassword).toHaveBeenCalledWith('2', 'new-hash');
    });

    it('returns 400 when password is too short', async () => {
      const response = await request(app)
        .patch('/api/admin/users/2/password')
        .send({ password: '123' });

      expect(response.status).toBe(400);
    });

    it('returns 404 when user not found', async () => {
      vi.mocked(userService.findById).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/admin/users/999/password')
        .send({ password: 'newpass123' });

      expect(response.status).toBe(404);
    });

    it('returns 500 on service error', async () => {
      vi.mocked(userService.findById).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .patch('/api/admin/users/2/password')
        .send({ password: 'newpass123' });

      expect(response.status).toBe(500);
    });
  });
});
