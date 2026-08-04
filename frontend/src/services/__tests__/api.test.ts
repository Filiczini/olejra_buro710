import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockPost, mockPut, mockDelete, mockPatch } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
  mockPatch: vi.fn(),
}));

vi.mock('../../api/client', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
    patch: mockPatch,
  },
}));

import { authService, activityLogService, postService, userService, contactService } from '../api';

beforeEach(() => {
  vi.clearAllMocks();
  mockGet.mockResolvedValue({ data: {} });
  mockPost.mockResolvedValue({ data: {} });
  mockPut.mockResolvedValue({ data: {} });
  mockDelete.mockResolvedValue({ data: {} });
  mockPatch.mockResolvedValue({ data: {} });
});

describe('postService.getAll', () => {
  it('omits query params that were not provided', async () => {
    await postService.getAll();

    expect(mockGet).toHaveBeenCalledWith('/posts?', undefined);
  });

  it('includes only the provided params', async () => {
    await postService.getAll({ page: 2, status: 'published' });

    const [url] = mockGet.mock.calls[0] as [string];
    const query = new URLSearchParams(url.split('?')[1]);
    expect(query.get('page')).toBe('2');
    expect(query.get('status')).toBe('published');
    expect(query.has('limit')).toBe(false);
    expect(query.has('search')).toBe(false);
  });

  it('includes all params when fully specified', async () => {
    await postService.getAll({ page: 1, limit: 5, status: 'draft', search: 'foo' });

    const [url] = mockGet.mock.calls[0] as [string];
    const query = new URLSearchParams(url.split('?')[1]);
    expect(query.get('page')).toBe('1');
    expect(query.get('limit')).toBe('5');
    expect(query.get('status')).toBe('draft');
    expect(query.get('search')).toBe('foo');
  });
});

describe('postService create/update', () => {
  it('create posts FormData with an extended timeout', async () => {
    const fd = new FormData();
    await postService.create(fd);

    expect(mockPost).toHaveBeenCalledWith('/posts', fd, { timeout: 120000 });
  });

  it('update puts FormData to the post id with an extended timeout', async () => {
    const fd = new FormData();
    await postService.update('post-1', fd);

    expect(mockPut).toHaveBeenCalledWith('/posts/post-1', fd, { timeout: 120000 });
  });

  it('delete calls the post id endpoint', async () => {
    await postService.delete('post-1');

    expect(mockDelete).toHaveBeenCalledWith('/posts/post-1', undefined);
  });

  it('getById and getBySlug hit distinct endpoints', async () => {
    await postService.getById('post-1');
    await postService.getBySlug('my-slug');

    expect(mockGet).toHaveBeenCalledWith('/posts/post-1', undefined);
    expect(mockGet).toHaveBeenCalledWith('/posts/public/my-slug', undefined);
  });
});

describe('activityLogService.getAll', () => {
  it('builds query params only from provided filters', async () => {
    await activityLogService.getAll({ user_email: 'a@b.c', action: 'delete' });

    const [url] = mockGet.mock.calls[0] as [string];
    const query = new URLSearchParams(url.split('?')[1]);
    expect(query.get('user_email')).toBe('a@b.c');
    expect(query.get('action')).toBe('delete');
    expect(query.has('page')).toBe(false);
  });
});

describe('userService', () => {
  it('create posts the new user payload', async () => {
    await userService.create({ email: 'a@b.c', password: 'secret123', role: 'editor' });

    expect(mockPost).toHaveBeenCalledWith(
      '/admin/users',
      { email: 'a@b.c', password: 'secret123', role: 'editor' },
      undefined
    );
  });

  it('updatePassword patches the password-specific endpoint', async () => {
    await userService.updatePassword('u1', 'new-secret');

    expect(mockPatch).toHaveBeenCalledWith(
      '/admin/users/u1/password',
      { password: 'new-secret' },
      undefined
    );
  });

  it('delete calls the user id endpoint', async () => {
    await userService.delete('u1');

    expect(mockDelete).toHaveBeenCalledWith('/admin/users/u1', undefined);
  });
});

describe('authService', () => {
  it('login posts credentials to the login endpoint', async () => {
    mockPost.mockResolvedValue({ data: { user: { id: 'u1' } } });

    const result = await authService.login('a@b.c', 'secret');

    expect(mockPost).toHaveBeenCalledWith(
      '/admin/login',
      { email: 'a@b.c', password: 'secret' },
      undefined
    );
    expect(result).toEqual({ user: { id: 'u1' } });
  });

  it('logout posts to the logout endpoint', async () => {
    await authService.logout();

    expect(mockPost).toHaveBeenCalledWith('/admin/logout', undefined, undefined);
  });
});

describe('contactService.submit', () => {
  it('posts the contact form payload', async () => {
    const formData = { name: 'A', email: 'a@b.c', phone: '+380441234567', message: 'Hello' };
    mockPost.mockResolvedValue({ data: { success: true } });

    const result = await contactService.submit(formData);

    expect(mockPost).toHaveBeenCalledWith('/contact', formData, undefined);
    expect(result).toEqual({ success: true });
  });
});
