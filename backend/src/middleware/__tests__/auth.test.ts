import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';

// Mock the JWT config module before importing
vi.mock('../../config/jwt', () => ({
  verifyToken: vi.fn(),
}));

import { authMiddleware } from '../auth';
import { verifyToken } from '../../config/jwt';

const mockedVerifyToken = vi.mocked(verifyToken);

describe('authMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      headers: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it('returns 401 when no Authorization header is present', () => {
    mockReq.headers = {};

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', () => {
    mockReq.headers = { authorization: 'Basic some-token' };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', () => {
    mockReq.headers = { authorization: 'Bearer invalid-token' };
    mockedVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith('invalid-token');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('returns 401 when token is expired', () => {
    mockReq.headers = { authorization: 'Bearer expired-token' };
    mockedVerifyToken.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith('expired-token');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('calls next() when token is valid', () => {
    const decoded = { userId: 'user-1', email: 'test@example.com', role: 'admin' };
    mockReq.headers = { authorization: 'Bearer valid-token' };
    mockedVerifyToken.mockReturnValue(decoded);

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith('valid-token');
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('attaches decoded user to request object', () => {
    const decoded = { userId: 'user-1', email: 'test@example.com', role: 'admin' };
    mockReq.headers = { authorization: 'Bearer valid-token' };
    mockedVerifyToken.mockReturnValue(decoded);

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect((mockReq as Request).user).toEqual(decoded);
  });

  it('extracts token correctly from Bearer prefix', () => {
    const decoded = { userId: 'user-1', email: 'test@example.com', role: 'admin' };
    mockReq.headers = { authorization: 'Bearer my-jwt-token-value' };
    mockedVerifyToken.mockReturnValue(decoded);

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockedVerifyToken).toHaveBeenCalledWith('my-jwt-token-value');
  });
});
