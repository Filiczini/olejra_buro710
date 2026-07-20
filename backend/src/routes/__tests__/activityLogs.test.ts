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
  editorMiddleware: (_req: any, _res: any, next: any) => next(),
}));

vi.mock('../../services/activityLogService', () => ({
  activityLogService: {
    getLogs: vi.fn(),
    getUniqueUsers: vi.fn(),
  },
}));

vi.mock('../../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

import activityLogsRouter from '../activityLogs';
import { activityLogService } from '../../services/activityLogService';
import { AppError } from '../../lib/errors';

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/logs', activityLogsRouter);
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

describe('Activity Logs Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('GET /api/logs', () => {
    it('returns paginated logs', async () => {
      const mockLogs = {
        data: [{ id: '1', action: 'create', user_email: 'admin@test.com' }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };
      vi.mocked(activityLogService.getLogs).mockResolvedValue(mockLogs as any);

      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogs);
      expect(activityLogService.getLogs).toHaveBeenCalledWith({});
    });

    it('passes query params to service', async () => {
      vi.mocked(activityLogService.getLogs).mockResolvedValue({
        data: [],
        pagination: { page: 2, limit: 10, total: 0, totalPages: 0 },
      } as any);

      await request(app).get('/api/logs?page=2&limit=10&user_email=admin@test.com&action=create');

      expect(activityLogService.getLogs).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        user_email: 'admin@test.com',
        action: 'create',
      });
    });

    it('returns 500 when service throws', async () => {
      vi.mocked(activityLogService.getLogs).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/logs');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/logs/users', () => {
    it('returns unique user emails', async () => {
      vi.mocked(activityLogService.getUniqueUsers).mockResolvedValue(['a@test.com', 'b@test.com']);

      const response = await request(app).get('/api/logs/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(['a@test.com', 'b@test.com']);
    });

    it('returns 500 when service throws', async () => {
      vi.mocked(activityLogService.getUniqueUsers).mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/logs/users');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});
