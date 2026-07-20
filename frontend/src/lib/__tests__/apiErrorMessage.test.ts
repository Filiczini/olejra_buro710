import { describe, it, expect } from 'vitest';
import { resolveApiErrorMessage } from '../apiErrorMessage';

interface FakeAxiosError {
  isAxiosError: true;
  code?: string;
  response?: { status: number; data?: unknown };
}

function axiosError(overrides: Partial<FakeAxiosError> = {}): FakeAxiosError {
  return { isAxiosError: true, ...overrides };
}

describe('resolveApiErrorMessage', () => {
  it('returns the fallback for a non-axios error', () => {
    expect(resolveApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });

  it('reports a timeout distinctly', () => {
    const error = axiosError({ code: 'ECONNABORTED' });
    expect(resolveApiErrorMessage(error, 'fallback')).toContain('час очікування');
  });

  it('reports a missing response as an offline error', () => {
    const error = axiosError();
    expect(resolveApiErrorMessage(error, 'fallback')).toContain('з’єднання');
  });

  it('maps 401 to a session-expired message', () => {
    const error = axiosError({ response: { status: 401 } });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Сесія закінчилась — увійдіть знову');
  });

  it('surfaces the backend message on 403', () => {
    const error = axiosError({
      response: { status: 403, data: { error: 'Editor access required' } },
    });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Editor access required');
  });

  it('falls back to a generic 403 message when the backend sends none', () => {
    const error = axiosError({ response: { status: 403 } });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Немає прав для цієї дії');
  });

  it('maps 413 to a file-too-large message', () => {
    const error = axiosError({ response: { status: 413 } });
    expect(resolveApiErrorMessage(error, 'fallback')).toContain('завеликий');
  });

  it('maps a 5xx status to a generic server-error message', () => {
    const error = axiosError({ response: { status: 502 } });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Помилка сервера — спробуйте пізніше');
  });

  it('uses the backend error text for other statuses when present', () => {
    const error = axiosError({
      response: { status: 409, data: { error: 'Slug already exists' } },
    });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('Slug already exists');
  });

  it('falls back to the provided default for other statuses without a backend message', () => {
    const error = axiosError({ response: { status: 400 } });
    expect(resolveApiErrorMessage(error, 'fallback')).toBe('fallback');
  });
});
