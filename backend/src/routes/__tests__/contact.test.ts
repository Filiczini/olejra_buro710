import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Application } from 'express';

// Mock rate limiter to bypass in tests
vi.mock('express-rate-limit', () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
}));

// Mock dependencies before importing the route
vi.mock('../../services/contactService', () => ({
  contactService: {
    create: vi.fn(),
  },
}));

vi.mock('../../lib/logger.js', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocking
import contactRouter from '../contact';
import { contactService } from '../../services/contactService';

const mockedContactService = vi.mocked(contactService);

// ============================================================================
// Test Constants
// ============================================================================

const VALID_CONTACT = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'This is a test message.',
};

// ============================================================================
// Test App Factory
// ============================================================================

const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/contact', contactRouter);
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      res.status(500).json({ error: err.message });
    }
  );
  return app;
};

// ============================================================================
// Tests
// ============================================================================

describe('Contact Route', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
    vi.clearAllMocks();
  });

  describe('POST /contact', () => {
    it('returns 200 on successful submission', async () => {
      const mockResult = {
        success: true,
        message: 'Повідомлення надіслано успішно',
        data: { id: 'c1', ...VALID_CONTACT },
      };
      mockedContactService.create.mockResolvedValue(mockResult);

      const res = await request(app).post('/contact').send(VALID_CONTACT);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockedContactService.create).toHaveBeenCalledWith(VALID_CONTACT);
    });

    it('returns 400 when name is missing', async () => {
      const { name: _, ...noName } = VALID_CONTACT;

      const res = await request(app).post('/contact').send(noName);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(mockedContactService.create).not.toHaveBeenCalled();
    });

    it('returns 400 when email is missing', async () => {
      const { email: _, ...noEmail } = VALID_CONTACT;

      const res = await request(app).post('/contact').send(noEmail);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(mockedContactService.create).not.toHaveBeenCalled();
    });

    it('returns 400 when subject is missing', async () => {
      const { subject: _, ...noSubject } = VALID_CONTACT;

      const res = await request(app).post('/contact').send(noSubject);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(mockedContactService.create).not.toHaveBeenCalled();
    });

    it('returns 400 when message is missing', async () => {
      const { message: _, ...noMessage } = VALID_CONTACT;

      const res = await request(app).post('/contact').send(noMessage);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(mockedContactService.create).not.toHaveBeenCalled();
    });

    it('returns 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/contact')
        .send({ ...VALID_CONTACT, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
      expect(mockedContactService.create).not.toHaveBeenCalled();
    });

    it('returns 400 when name is empty string', async () => {
      const res = await request(app)
        .post('/contact')
        .send({ ...VALID_CONTACT, name: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 400 when body is empty', async () => {
      const res = await request(app).post('/contact').send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 500 when contactService throws', async () => {
      mockedContactService.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/contact').send(VALID_CONTACT);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Помилка при відправці повідомлення');
    });

    it('includes validation details with field names', async () => {
      const res = await request(app).post('/contact').send({ name: 'John' }); // missing email, subject, message

      expect(res.status).toBe(400);
      expect(res.body.details).toBeDefined();
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThan(0);

      const fields = res.body.details.map((d: { field: string }) => d.field);
      expect(fields).toContain('email');
      expect(fields).toContain('subject');
      expect(fields).toContain('message');
    });
  });
});
