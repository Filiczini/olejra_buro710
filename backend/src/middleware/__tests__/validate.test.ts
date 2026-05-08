import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateBody, validateFormData } from '../validate';

const mockWarn = vi.fn();
vi.mock('../../lib/logger.js', () => ({
  logger: {
    warn: (...args: unknown[]) => mockWarn(...args),
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('validateBody', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn().mockReturnThis();
    req = { body: {} };
    res = { status: statusMock, json: jsonMock };
    next = vi.fn();
    mockWarn.mockClear();
  });

  it('calls next() when body is valid', async () => {
    const schema = z.object({ name: z.string() });
    req.body = { name: 'John' };

    await validateBody(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it('returns 400 when body is invalid', async () => {
    const schema = z.object({ name: z.string() });
    req.body = { name: 123 };

    await validateBody(schema)(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({ field: 'name', message: expect.any(String) }),
        ]),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 400 when required field is missing', async () => {
    const schema = z.object({ email: z.string().email() });
    req.body = {};

    await validateBody(schema)(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
        details: expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      })
    );
  });

  it('logs validation errors with logger.warn', async () => {
    const schema = z.object({ age: z.number() });
    req.body = { age: 'not-a-number' };

    await validateBody(schema)(req as Request, res as Response, next);

    expect(mockWarn).toHaveBeenCalledWith('Validation error', expect.any(Array));
  });

  it('handles nested field errors correctly', async () => {
    const schema = z.object({
      user: z.object({ name: z.string() }),
    });
    req.body = { user: { name: 123 } };

    await validateBody(schema)(req as Request, res as Response, next);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.arrayContaining([expect.objectContaining({ field: 'user.name' })]),
      })
    );
  });
});

describe('validateFormData', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: any;
  let jsonMock: any;

  beforeEach(() => {
    statusMock = vi.fn().mockReturnThis();
    jsonMock = vi.fn().mockReturnThis();
    req = { body: {} };
    res = { status: statusMock, json: jsonMock };
    next = vi.fn();
    mockWarn.mockClear();
  });

  it('calls next() when form data is valid', async () => {
    const schema = z.object({ title: z.string() });
    req.body = { title: 'Hello' };

    await validateFormData(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ title: 'Hello' });
  });

  it('parses JSON tags field before validation', async () => {
    const schema = z.object({ tags: z.array(z.string()) });
    req.body = { tags: '["a", "b"]' };

    await validateFormData(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ tags: ['a', 'b'] });
  });

  it('falls back to raw string when tags JSON is invalid', async () => {
    const schema = z.object({ tags: z.union([z.array(z.string()), z.string()]) });
    req.body = { tags: 'not-json' };

    await validateFormData(schema)(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.body).toEqual({ tags: 'not-json' });
  });

  it('returns 400 when parsed form data is invalid', async () => {
    const schema = z.object({ count: z.number() });
    req.body = { count: 'abc' };

    await validateFormData(schema)(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes through non-tag fields unchanged', async () => {
    const schema = z.object({ title: z.string(), count: z.number() });
    req.body = { title: 'Hello', count: 5 };

    await validateFormData(schema)(req as Request, res as Response, next);

    expect(req.body).toEqual({ title: 'Hello', count: 5 });
  });
});
