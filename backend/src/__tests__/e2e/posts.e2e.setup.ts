/**
 * Shared E2E test setup for Posts API
 *
 * Reusable utilities and in-memory store for E2E test files.
 *
 * @module e2e/posts.e2e.setup
 */

import { beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { Application } from 'express';
import type { Test } from 'supertest';
import type { Post } from '@buro710/shared';
import postsRouter from '../../routes/api/posts';

// ============================================================================
// In-memory store for E2E test simulation
// ============================================================================

export interface PostStore {
  posts: Map<string, Post>;
  idCounter: number;
}

export const store: PostStore = {
  posts: new Map(),
  idCounter: 1,
};

export const resetStore = () => {
  store.posts.clear();
  store.idCounter = 1;
};

// ============================================================================
// Test Constants
// ============================================================================

export const TEST_API_KEY = 'test-api-key-e2e-testing';
export const INVALID_API_KEY = 'invalid-key-e2e';

// ============================================================================
// Test App Factory
// ============================================================================

export const createTestApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/api/v1/posts', postsRouter);
  // Error handler
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      if (
        'statusCode' in err &&
        typeof (err as Error & { statusCode?: number }).statusCode === 'number'
      ) {
        res.status((err as Error & { statusCode: number }).statusCode).json({ error: err.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  );
  return app;
};

// ============================================================================
// Helper Functions
// ============================================================================

export const withApiKey = (req: Test, key: string = TEST_API_KEY) => req.set('X-API-Key', key);

// ============================================================================
// Global Setup / Teardown
// ============================================================================

let originalApiKey: string | undefined;

beforeAll(() => {
  originalApiKey = process.env.API_KEY;
  process.env.API_KEY = TEST_API_KEY;
});

afterAll(() => {
  process.env.API_KEY = originalApiKey;
});
