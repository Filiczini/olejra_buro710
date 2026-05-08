import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { requestIdMiddleware } from '../requestId';

const mockInfo = vi.fn();
const mockWarn = vi.fn();

vi.mock('../../lib/logger', () => ({
  logger: {
    info: (...args: unknown[]) => mockInfo(...args),
    warn: (...args: unknown[]) => mockWarn(...args),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('requestIdMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let setHeaderMock: ReturnType<typeof vi.fn>;
  let onMock: ReturnType<typeof vi.fn>;
  let emitFinish: (() => void) | null = null;

  beforeEach(() => {
    setHeaderMock = vi.fn();
    onMock = vi.fn().mockImplementation((event: string, handler: () => void) => {
      if (event === 'finish') emitFinish = handler;
    });
    req = {
      method: 'GET',
      originalUrl: '/api/posts',
      headers: {},
    };
    res = {
      statusCode: 200,
      setHeader: setHeaderMock,
      on: onMock,
    };
    next = vi.fn();
    mockInfo.mockClear();
    mockWarn.mockClear();
    emitFinish = null;
  });

  it('calls next()', () => {
    requestIdMiddleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('uses existing x-request-id header when present', () => {
    req.headers = { 'x-request-id': 'existing-id-123' };

    requestIdMiddleware(req as Request, res as Response, next);

    expect(req.requestId).toBe('existing-id-123');
    expect(setHeaderMock).toHaveBeenCalledWith('X-Request-Id', 'existing-id-123');
  });

  it('generates a UUID when no x-request-id header is present', () => {
    requestIdMiddleware(req as Request, res as Response, next);

    expect(req.requestId).toBeDefined();
    expect(req.requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(setHeaderMock).toHaveBeenCalledWith('X-Request-Id', req.requestId);
  });

  it('logs request with info level on success', () => {
    requestIdMiddleware(req as Request, res as Response, next);
    expect(emitFinish).not.toBeNull();
    emitFinish!();

    expect(mockInfo).toHaveBeenCalledOnce();
    expect(mockInfo).toHaveBeenCalledWith(
      'GET /api/posts 200',
      expect.objectContaining({
        requestId: expect.any(String),
        method: 'GET',
        url: '/api/posts',
        statusCode: 200,
        duration: expect.stringMatching(/^\d+ms$/),
      })
    );
  });

  it('logs request with warn level on error status', () => {
    res.statusCode = 500;
    requestIdMiddleware(req as Request, res as Response, next);
    emitFinish!();

    expect(mockWarn).toHaveBeenCalledOnce();
    expect(mockWarn).toHaveBeenCalledWith(
      'GET /api/posts 500',
      expect.objectContaining({
        statusCode: 500,
      })
    );
  });

  it('includes userId in log when req.user is present', () => {
    (req as any).user = { userId: 'user-123' };
    requestIdMiddleware(req as Request, res as Response, next);
    emitFinish!();

    expect(mockInfo).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        userId: 'user-123',
      })
    );
  });
});
