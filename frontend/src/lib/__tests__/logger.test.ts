import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('logger', () => {
  const originalEnv = import.meta.env.DEV;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has all required methods', () => {
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('debug');
  });

  it('error method calls console.error', () => {
    logger.error('Test error message');
    expect(console.error).toHaveBeenCalled();
  });

  it('error method includes context when provided', () => {
    logger.error('Test error', { key: 'value' });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Test error'),
      { key: 'value' }
    );
  });

  it('error method works without context', () => {
    logger.error('Test error');
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('[ERROR] Test error'),
      ''
    );
  });
});
