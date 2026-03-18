import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { validateApiKey, apiKeyMiddleware } from '../apiKey';

describe('apiKey middleware', () => {
  describe('validateApiKey (pure function)', () => {
    describe('Happy Path', () => {
      it('returns { valid: true } when provided key matches expected key', () => {
        // Arrange
        const providedKey = 'test-api-key-123';
        const expectedKey = 'test-api-key-123';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({ valid: true });
      });
    });

    describe('Edge Cases', () => {
      it('returns 401 error when expected key is undefined (API_KEY not configured)', () => {
        // Arrange
        const providedKey = 'some-key';
        const expectedKey = undefined;

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'API key authentication unavailable',
          statusCode: 401,
        });
      });

      it('returns 401 error when provided key is undefined (missing header)', () => {
        // Arrange
        const providedKey = undefined;
        const expectedKey = 'valid-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'API key is required',
          statusCode: 401,
        });
      });

      it('returns 401 error when provided key is empty string (treated as missing)', () => {
        // Arrange
        const providedKey = '';
        const expectedKey = 'valid-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert - empty string is falsy, treated as missing key
        expect(result).toEqual({
          valid: false,
          error: 'API key is required',
          statusCode: 401,
        });
      });

      it('returns 401 error when provided key does not match expected key', () => {
        // Arrange
        const providedKey = 'wrong-key';
        const expectedKey = 'valid-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'Invalid API key',
          statusCode: 401,
        });
      });

      it('returns 401 error when both keys are undefined', () => {
        // Arrange
        const providedKey = undefined;
        const expectedKey = undefined;

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'API key authentication unavailable',
          statusCode: 401,
        });
      });
    });

    describe('Security Tests', () => {
      it('is case-sensitive: different case returns 401 error', () => {
        // Arrange
        const providedKey = 'TEST-API-KEY';
        const expectedKey = 'test-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'Invalid API key',
          statusCode: 401,
        });
      });

      it('does not trim whitespace: leading whitespace returns 401 error', () => {
        // Arrange
        const providedKey = ' test-api-key';
        const expectedKey = 'test-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'Invalid API key',
          statusCode: 401,
        });
      });

      it('does not trim whitespace: trailing whitespace returns 401 error', () => {
        // Arrange
        const providedKey = 'test-api-key ';
        const expectedKey = 'test-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'Invalid API key',
          statusCode: 401,
        });
      });

      it('is exact match: extra characters return 401 error', () => {
        // Arrange
        const providedKey = 'test-api-key-extra';
        const expectedKey = 'test-api-key';

        // Act
        const result = validateApiKey(providedKey, expectedKey);

        // Assert
        expect(result).toEqual({
          valid: false,
          error: 'Invalid API key',
          statusCode: 401,
        });
      });
    });
  });

  describe('apiKeyMiddleware (Express middleware)', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let originalApiKey: string | undefined;

    beforeEach(() => {
      // Save original API_KEY
      originalApiKey = process.env.API_KEY;

      // Reset mocks
      mockReq = {
        headers: {},
      };
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };
      mockNext = vi.fn();
    });

    afterEach(() => {
      // Restore original API_KEY
      if (originalApiKey === undefined) {
        delete process.env.API_KEY;
      } else {
        process.env.API_KEY = originalApiKey;
      }
      vi.clearAllMocks();
    });

    describe('Happy Path', () => {
      it('calls next() when valid API key is provided in X-API-Key header', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = { 'x-api-key': 'valid-api-key' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalledTimes(1);
        expect(mockRes.status).not.toHaveBeenCalled();
        expect(mockRes.json).not.toHaveBeenCalled();
      });
    });

    describe('Edge Cases', () => {
      it('returns 401 with error message when X-API-Key header is missing', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = {};

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key is required' });
      });

      it('returns 401 with error message when X-API-Key header is empty string', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = { 'x-api-key': '' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert - empty string is falsy, treated as missing key
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key is required' });
      });

      it('returns 401 with error message when API key is wrong', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = { 'x-api-key': 'wrong-key' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
      });

      it('returns 401 with error message when API_KEY environment variable is not set', () => {
        // Arrange
        delete process.env.API_KEY;
        mockReq.headers = { 'x-api-key': 'any-key' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'API key authentication unavailable' });
      });
    });

    describe('Security Tests', () => {
      it('rejects API key with wrong case (case-sensitive)', () => {
        // Arrange
        process.env.API_KEY = 'secret-key';
        mockReq.headers = { 'x-api-key': 'SECRET-KEY' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
      });

      it('rejects API key with leading whitespace', () => {
        // Arrange
        process.env.API_KEY = 'secret-key';
        mockReq.headers = { 'x-api-key': ' secret-key' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
      });

      it('rejects API key with trailing whitespace', () => {
        // Arrange
        process.env.API_KEY = 'secret-key';
        mockReq.headers = { 'x-api-key': 'secret-key ' };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
      });
    });

    describe('Response Format', () => {
      it('returns error response in correct format { error: string }', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = {};

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.any(String),
          })
        );
      });

      it('uses chaining pattern: res.status().json()', () => {
        // Arrange
        process.env.API_KEY = 'valid-api-key';
        mockReq.headers = {};
        const statusMock = vi.fn().mockReturnThis();
        const jsonMock = vi.fn().mockReturnThis();
        mockRes = {
          status: statusMock,
          json: jsonMock,
        };

        // Act
        apiKeyMiddleware(mockReq as Request, mockRes as Response, mockNext);

        // Assert
        expect(statusMock).toHaveBeenCalledBefore(jsonMock);
      });
    });
  });
});
