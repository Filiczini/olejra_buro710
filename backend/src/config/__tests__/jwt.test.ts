import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken, type JwtPayload } from '../jwt';

const payload: JwtPayload = {
  userId: 'user-1',
  email: 'user@example.com',
  role: 'admin',
  tokenVersion: 3,
};

describe('generateToken / verifyToken', () => {
  it('round-trips a payload through sign and verify', () => {
    const token = generateToken(payload);
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.tokenVersion).toBe(payload.tokenVersion);
  });

  it('rejects a malformed token', () => {
    expect(() => verifyToken('not-a-jwt')).toThrow('Invalid token');
  });

  it('rejects a token signed with a different secret', () => {
    const forged = jwt.sign(payload, 'a-completely-different-secret-value', {
      expiresIn: '30m',
    });

    expect(() => verifyToken(forged)).toThrow('Invalid token');
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: -10 });

    expect(() => verifyToken(expired)).toThrow('Invalid token');
  });

  it('rejects a token whose payload was tampered with', () => {
    const token = generateToken(payload);
    const [header, , signature] = token.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...payload, role: 'admin', tokenVersion: 999 })
    )
      .toString('base64')
      .replace(/=/g, '');
    const tampered = `${header}.${tamperedPayload}.${signature}`;

    expect(() => verifyToken(tampered)).toThrow('Invalid token');
  });
});
