import { describe, it, expect } from 'vitest';
import { envSchema } from '../env';

describe('envSchema', () => {
  const baseEnv = {
    JWT_SECRET: 'a'.repeat(32),
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/test',
  };

  it('accepts minimal valid env with defaults', () => {
    const result = envSchema.safeParse(baseEnv);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.PORT).toBe(3000);
    expect(result.data.NODE_ENV).toBe('development');
    expect(result.data.FRONTEND_URL).toBe('http://localhost:5173');
    expect(result.data.UPLOADS_DIR).toBe('/app/uploads');
  });

  it('parses custom PORT as number', () => {
    const result = envSchema.safeParse({ ...baseEnv, PORT: '8080' });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.PORT).toBe(8080);
  });

  it('accepts valid production env', () => {
    const result = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      FRONTEND_URL: 'https://example.com',
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.NODE_ENV).toBe('production');
  });

  it('fails when FRONTEND_URL is HTTP in production', () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const result = envSchema.safeParse({
      ...baseEnv,
      NODE_ENV: 'production',
      FRONTEND_URL: 'http://example.com',
    });
    process.env.NODE_ENV = original;

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues.some((i) => i.message.includes('HTTPS'))).toBe(true);
  });

  it('fails when JWT_SECRET is too short', () => {
    const result = envSchema.safeParse({ ...baseEnv, JWT_SECRET: 'short' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toContain('at least 32 characters');
  });

  it('fails when DATABASE_URL is invalid', () => {
    const result = envSchema.safeParse({ ...baseEnv, DATABASE_URL: 'not-a-url' });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toContain('valid URL');
  });

  it('fails when JWT_SECRET is missing', () => {
    const { JWT_SECRET: _, ...rest } = baseEnv;
    const result = envSchema.safeParse(rest);

    expect(result.success).toBe(false);
  });

  it('fails when DATABASE_URL is missing', () => {
    const { DATABASE_URL: _, ...rest } = baseEnv;
    const result = envSchema.safeParse(rest);

    expect(result.success).toBe(false);
  });
});
