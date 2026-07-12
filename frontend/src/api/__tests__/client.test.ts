import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

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
  const createFn = vi.fn(() => mockAxiosInstance);
  return {
    default: {
      create: createFn,
      post: mockedAxiosPost,
    },
    create: createFn,
    post: mockedAxiosPost,
  };
});

let requestOnFulfilled: (config: Record<string, unknown>) => Record<string, unknown>;
let responseOnRejected: (error: Record<string, unknown>) => Promise<never>;

describe('API client', () => {
  beforeAll(async () => {
    vi.resetModules();
    await import('../client');
    requestOnFulfilled = requestUse.mock.calls[0][0];
    responseOnRejected = responseUse.mock.calls[0][1];
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error: overriding read-only location for tests
    window.location = { href: '', pathname: '/admin/posts' };
  });

  describe('request interceptor', () => {
    it('removes Content-Type header for FormData payloads', () => {
      const config = { headers: { 'Content-Type': 'application/json' }, data: new FormData() };
      const result = requestOnFulfilled(config);
      expect(result.headers['Content-Type']).toBeUndefined();
    });

    it('keeps Content-Type for JSON payloads', () => {
      const config = { headers: { 'Content-Type': 'application/json' }, data: { a: 1 } };
      const result = requestOnFulfilled(config);
      expect(result.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('response interceptor — 401 handling', () => {
    it('refreshes via cookie and retries original request', async () => {
      mockedAxiosPost.mockResolvedValueOnce({ data: { user: { id: 'u1' } } });
      mockAxiosInstance.mockResolvedValueOnce({ data: 'retried' });

      const originalConfig = { url: '/api/admin/posts', headers: {}, _retry: false };
      const error = {
        response: { status: 401 },
        config: originalConfig,
      };

      await responseOnRejected(error);

      expect(mockedAxiosPost).toHaveBeenCalledWith(
        '/api/admin/refresh',
        {},
        expect.objectContaining({ withCredentials: true })
      );
      expect(mockAxiosInstance).toHaveBeenCalledWith(originalConfig);
    });

    it('redirects to login when refresh fails on an admin page', async () => {
      mockedAxiosPost.mockRejectedValueOnce(new Error('Refresh failed'));

      const error = {
        response: { status: 401 },
        config: { url: '/api/admin/posts', headers: {}, _retry: false },
      };

      await expect(responseOnRejected(error)).rejects.toEqual(error);
      expect(window.location.href).toBe('/admin/login');
    });

    it('does not retry the login endpoint', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/admin/login', headers: {}, _retry: false },
      };

      await expect(responseOnRejected(error)).rejects.toEqual(error);
      expect(mockedAxiosPost).not.toHaveBeenCalled();
    });

    it('does not retry the me endpoint (auth probe)', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/api/admin/me', headers: {}, _retry: false },
      };

      await expect(responseOnRejected(error)).rejects.toEqual(error);
      expect(mockedAxiosPost).not.toHaveBeenCalled();
    });

    it('passes through non-401 errors untouched', async () => {
      const error = { response: { status: 500 }, config: { url: '/api/admin/posts' } };
      await expect(responseOnRejected(error)).rejects.toEqual(error);
    });
  });
});
