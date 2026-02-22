import type { Request, Response, NextFunction } from 'express';

type ValidationResult = { valid: true } | { valid: false; error: string; statusCode: 401 | 500 };

/**
 * Pure function to validate API key
 */
export const validateApiKey = (
  providedKey: string | undefined,
  expectedKey: string | undefined
): ValidationResult => {
  if (!expectedKey) {
    return { valid: false, error: 'API key not configured', statusCode: 500 };
  }

  if (!providedKey) {
    return { valid: false, error: 'API key is required', statusCode: 401 };
  }

  if (providedKey !== expectedKey) {
    return { valid: false, error: 'Invalid API key', statusCode: 401 };
  }

  return { valid: true };
};

/**
 * Express middleware for API key authentication
 * Validates X-API-Key header against API_KEY environment variable
 */
export const apiKeyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.headers['x-api-key'] as string | undefined;
  const expectedKey = process.env.API_KEY;

  const result = validateApiKey(providedKey, expectedKey);

  if (!result.valid) {
    res.status(result.statusCode).json({ error: result.error });
    return;
  }

  next();
};

export default apiKeyMiddleware;
