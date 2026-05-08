import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
    vi.resetModules();
  });

  it('logs info with console.log in development', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../logger');

    logger.info('hello');

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO]'), '');
  });

  it('logs error with console.error in development', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../logger');

    logger.error('fail');

    expect(consoleErrorSpy).toHaveBeenCalledOnce();
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR]'), '');
  });

  it('logs warn with console.warn in development', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../logger');

    logger.warn('careful');

    expect(consoleWarnSpy).toHaveBeenCalledOnce();
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[WARN]'), '');
  });

  it('outputs JSON in production', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../logger');

    logger.info('hello');

    expect(consoleLogSpy).toHaveBeenCalledOnce();
    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed).toMatchObject({
      level: 'info',
      message: 'hello',
    });
    expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('formats Error context with message and stack', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../logger');
    const err = new Error('boom');

    logger.error('fail', err);

    const output = consoleErrorSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.error).toBe('boom');
    expect(parsed.stack).toBeDefined();
  });

  it('formats object context by spreading it', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../logger');

    logger.info('hello', { foo: 'bar' });

    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.foo).toBe('bar');
  });

  it('formats primitive context as details', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../logger');

    logger.info('hello', 42);

    const output = consoleLogSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.details).toBe(42);
  });

  it('does not log debug in production', async () => {
    process.env.NODE_ENV = 'production';
    const { logger } = await import('../logger');

    logger.debug('hidden');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('logs debug in development', async () => {
    process.env.NODE_ENV = 'development';
    const { logger } = await import('../logger');

    logger.debug('visible');

    expect(consoleLogSpy).toHaveBeenCalledOnce();
  });
});
