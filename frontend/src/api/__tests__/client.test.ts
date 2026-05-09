import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAxiosInstance, mockedAxiosPost, requestUse, responseUse } = vi.hoisted(() => {
  const post = vi.fn();
  const callable = vi.fn();
  const reqUse = vi.fn();
  const respUse = vi.fn();
  const instance = Object.assign(callable, {
    interceptors: {
      request: { use: reqUse },
      response: { use: respUse },
    },
    post: vi.fn(),
  });
  return {
    mockAxiosInstance: instance,
    mockedAxiosPost: post,
    requestUse: reqUse,
    responseUse: respUse,
  };
});

vi.mock('axios', () => {
  const createFn = vi.fn(() => {
    console.log('axios.create called, returning mockAxiosInstance');
    return mockAxiosInstance;
  });
  return {
    default: {
      create: createFn,
      post: mockedAxiosPost,
    },
  };
});

// Must import AFTER vi.mock hoists — side-effect registers interceptors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import api from '../client';

console.log('requestUse type:', typeof requestUse, 'mock:', requestUse.mock);

// Extract interceptor handlers from the calls made during module import
const requestOnFulfilled = requestUse.mock.calls[0][0] as (
  config: Record<string, unknown>
) => Record<string, unknown>;
const responseOnRejected = responseUse.mock.calls[0][1] as (
  error: Record<string, unknown>
) => Promise<never>;

describe('API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // @ts-expect-error: overriding read-only location for tests
    window.location = { href: '' };
  });

  describe('request interceptor', () => {
    it('adds Bearer token when present in localStorage', () => {
      localStorage.setItem('token', 'abc123');
      const config = { headers: {} };
      const result = requestOnFulfilled(config);
      expect(result.headers.Authorization).toBe('Bearer abc123');
    });

    it('removes Content-Type header for FormData payloads', () => {
      localStorage.setItem('token', 'tok');
      const config = { headers: { 'Content-Type': 'application/json' }, data: new FormData() };
      const result = requestOnFulfilled(config);
      expect(result.headers['Content-Type']).toBeUndefined();
    });

    it('does not add Authorization when no token', () => {
      const config = { headers: {} };
      const result = requestOnFulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor — 401 handling', () => {
    it('redirects to login when 401 and no refresh token', async () => {
      localStorage.setItem('token', 'old');
      const error = {
        response: { status: 401 },
        config: { url: '/api/admin/posts', _retry: false },
      };
      await expect(responseOnRejected(error)).rejects.toEqual(error);
      expect(window.location.href).toBe('/admin/login');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('refreshes token and retries original request', async () => {
      localStorage.setItem('token', 'old');
      localStorage.setItem('refreshToken', 'refresh-xyz');
      localStorage.setItem('user', JSON.stringify({ id: 'u1' }));

      mockedAxiosPost.mockResolvedValueOnce({
        data: { token: 'new-token', refreshToken: 'new-refresh', user: { id: 'u1' } },
      });

      const originalConfig = { url: '/api/admin/posts', headers: {}, _retry: false };
      const error = {
        response: { status: 401 },
        config: originalConfig,
      };

      await responseOnRejected(error);

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        '/api/admin/refresh',
        { refreshToken: 'refresh-xyz', userId: 'u1' },
        expect.any(Object)
      );
      expect(localStorage.getItem('token')).toBe('new-token');
      expect(originalConfig.headers.Authorization).toBe('Bearer new-token');
    });

    it('redirects to login when refresh fails', async () => {
      localStorage.setItem('token', 'old');
      localStorage.setItem('refreshToken', 'refresh-xyz');
      localStorage.setItem('user', JSON.stringify({ id: 'u1' }));

      mockedAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));

      const error = {
        response: { status: 401 },
        config: { url: '/api/admin/posts', headers: {}, _retry: false },
      };

      await expect(responseOnRejected(error)).rejects.toEqual(error);
      expect(window.location.href).toBe('/admin/login');
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('passes through non-401 errors untouched', async () => {
      const error = { response: { status: 500 }, config: { url: '/api/admin/posts' } };
      await expect(responseOnRejected(error)).rejects.toEqual(error);
    });
  });
});
