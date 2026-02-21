import type { NextFunction, Request, Response } from 'express';
import type { ZodType, ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export const validateBody = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      const zodError = error as ZodError;
      logger.warn('Validation error', zodError.issues);
      res.status(400).json({
        error: 'Validation failed',
        details: zodError.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
};

export const validateFormData = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(req.body)) {
        if (key === 'tags' && typeof value === 'string') {
          try {
            parsedData[key] = JSON.parse(value);
          } catch {
            parsedData[key] = value;
          }
        } else {
          parsedData[key] = value;
        }
      }

      await schema.parseAsync(parsedData);
      req.body = parsedData;
      next();
    } catch (error) {
      const zodError = error as ZodError;
      logger.warn('Validation error', zodError.issues);
      res.status(400).json({
        error: 'Validation failed',
        details: zodError.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }
  };
};
