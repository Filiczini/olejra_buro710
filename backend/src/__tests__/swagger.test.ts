import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Swagger docs', () => {
  it('GET /api/docs returns HTML', async () => {
    const res = await request(app).get('/api/docs').expect(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });

  it('GET /api/docs.json returns valid OpenAPI spec', async () => {
    const res = await request(app).get('/api/docs.json').expect(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('Buro 710 External API');
    expect(res.body.paths).toBeDefined();
    expect(Object.keys(res.body.paths)).toContain('/posts');
  });
});
