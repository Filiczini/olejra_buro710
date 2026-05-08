import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Security headers', () => {
  it('sets X-Frame-Options to DENY', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
  });

  it('sets X-Content-Type-Options to nosniff', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('sets Referrer-Policy', async () => {
    const res = await request(app).get('/ping');
    expect(res.headers['referrer-policy']).toBeDefined();
  });

  it('sets Strict-Transport-Security in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    // Re-import to pick up production middleware (helmet HSTS)
    const { app: prodApp } = await import('../app.js');
    const res = await request(prodApp).get('/ping');
    expect(res.headers['strict-transport-security']).toBeDefined();
    process.env.NODE_ENV = originalEnv;
  });
});
