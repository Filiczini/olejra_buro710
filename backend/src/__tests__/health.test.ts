import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Health endpoints', () => {
  it('GET /ping returns pong', async () => {
    const res = await request(app).get('/ping').expect(200);
    expect(res.text).toBe('pong');
  });

  it('GET /health returns status and timestamp', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.status);
    expect(['ok', 'degraded']).toContain(res.body.status);
    expect(res.body.timestamp).toBeDefined();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});
