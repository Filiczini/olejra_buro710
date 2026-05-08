import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { execSync } from 'child_process';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';

let container: Awaited<ReturnType<PostgreSqlContainer['start']>>;
let databaseUrl: string;
let pool: pg.Pool;
let db: ReturnType<typeof drizzle>;

// Services (dynamically imported after DB is ready)
let userService: typeof import('../../services/userService').userService;
let postService: typeof import('../../services/postService').postService;
let contactService: typeof import('../../services/contactService').contactService;

beforeAll(async () => {
  try {
    container = await new PostgreSqlContainer('postgres:17-alpine')
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .start();
  } catch (err: any) {
    if (err?.message?.includes('container runtime')) {
      throw new Error(
        'Docker не знайдено. Для інтеграційних тестів потрібен Docker Desktop (або альтернатива). ' +
          'Встановіть і запустіть Docker, або запускайте тести в CI де Docker доступний автоматично.'
      );
    }
    throw err;
  }

  databaseUrl = container.getConnectionUri();
  process.env.DATABASE_URL = databaseUrl;

  // Push schema
  execSync('npx drizzle-kit push', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'pipe',
  });

  // Seed admin
  execSync('npx tsx src/seed-admin.ts', {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      ADMIN_EMAIL: 'admin@test.com',
      ADMIN_PASSWORD: 'admin123',
    },
    stdio: 'pipe',
  });

  // Create fresh db instance for tests
  pool = new pg.Pool({ connectionString: databaseUrl, max: 5 });
  db = drizzle(pool, { schema });

  // Mock telegram before importing contactService
  vi.doMock('../../services/telegramService', () => ({
    telegramService: {
      sendMessage: vi.fn().mockResolvedValue({ success: true, messageId: 'test-123' }),
    },
  }));

  // Mock storageService to avoid filesystem side effects
  vi.doMock('../../services/storageService', () => ({
    storageService: {
      deleteImages: vi.fn().mockResolvedValue(undefined),
      deleteImage: vi.fn().mockResolvedValue({ success: true }),
    },
  }));

  // Reset modules so that db/index.ts re-evaluates with new DATABASE_URL
  vi.resetModules();

  // Re-import db with new DATABASE_URL
  await import('../../db/index');
  // Override the exported db and pool with our test instances
  vi.doMock('../../db', () => ({ db, pool, schema }));

  // Now import services — they will pick up the mocked db
  const userMod = await import('../../services/userService');
  const postMod = await import('../../services/postService');
  const contactMod = await import('../../services/contactService');

  userService = userMod.userService;
  postService = postMod.postService;
  contactService = contactMod.contactService;
}, 120_000);

afterAll(async () => {
  await pool?.end();
  await container?.stop();
});

describe('userService integration', () => {
  it('finds admin user seeded during setup', async () => {
    const user = await userService.findByEmail('admin@test.com');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@test.com');
    expect(user?.role).toBe('admin');
  });

  it('creates and finds a new user', async () => {
    const created = await userService.create('integration@test.com', 'fake-hash', 'editor');
    expect(created.email).toBe('integration@test.com');
    expect(created.role).toBe('editor');

    const found = await userService.findByEmail('integration@test.com');
    expect(found?.email).toBe('integration@test.com');
  });

  it('increments token version', async () => {
    const created = await userService.create('token@test.com', 'hash', 'admin');
    const initial = await userService.getTokenVersion(created.id);
    expect(initial).toBe(0);

    await userService.incrementTokenVersion(created.id);
    const updated = await userService.getTokenVersion(created.id);
    expect(updated).toBe(1);
  });

  it('deletes a user', async () => {
    const created = await userService.create('delete@test.com', 'hash', 'editor');
    await userService.delete(created.id);
    const found = await userService.findById(created.id);
    expect(found).toBeNull();
  });
});

describe('postService integration', () => {
  it('creates a post without blocks', async () => {
    const post = await postService.create({
      title: 'Integration Test Post',
      slug: 'integration-test-post',
      status: 'published',
    });

    expect(post.title).toBe('Integration Test Post');
    expect(post.slug).toBe('integration-test-post');
    expect(post.status).toBe('published');
  });

  it('creates a post with auto-generated slug', async () => {
    const post = await postService.create({
      title: 'Auto Slug Post',
    });

    expect(post.slug).toBe('auto-slug-post');
  });

  it('gets post by id', async () => {
    const created = await postService.create({ title: 'Get By ID', slug: 'get-by-id' });
    const result = await postService.getById(created.id);

    expect(result.post.id).toBe(created.id);
    expect(result.post.title).toBe('Get By ID');
    expect(Array.isArray(result.blocks)).toBe(true);
  });

  it('lists posts with pagination', async () => {
    await postService.create({ title: 'Paginated 1', slug: 'paginated-1', status: 'published' });
    await postService.create({ title: 'Paginated 2', slug: 'paginated-2', status: 'draft' });

    const all = await postService.getAll({ page: 1, limit: 10 });
    expect(all.data.length).toBeGreaterThanOrEqual(2);
    expect(all.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('filters posts by status', async () => {
    await postService.create({ title: 'Draft Post', slug: 'draft-post', status: 'draft' });

    const drafts = await postService.getAll({ status: 'draft' });
    expect(drafts.data.some((p) => p.slug === 'draft-post')).toBe(true);

    const published = await postService.getAll({ status: 'published' });
    expect(published.data.some((p) => p.slug === 'draft-post')).toBe(false);
  });

  it('updates a post', async () => {
    const created = await postService.create({ title: 'Update Me', slug: 'update-me' });
    const updated = await postService.update(created.id, { title: 'Updated Title' });

    expect(updated.title).toBe('Updated Title');
    expect(updated.slug).toBe('update-me');
  });

  it('soft-deletes a post', async () => {
    const created = await postService.create({ title: 'Delete Me', slug: 'delete-me' });
    await postService.delete(created.id);

    const all = await postService.getAll();
    expect(all.data.some((p) => p.id === created.id)).toBe(false);
  });

  it('throws NotFoundError for missing post', async () => {
    await expect(postService.getById('00000000-0000-0000-0000-000000000000')).rejects.toThrow(
      'Post not found'
    );
  });
});

describe('contactService integration', () => {
  it('creates a contact message', async () => {
    const result = await contactService.create({
      name: 'Іван',
      email: 'ivan@test.com',
      subject: 'Запит',
      message: 'Хочу замовити проєкт',
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe('ivan@test.com');
  });

  it('paginates contact messages', async () => {
    await contactService.create({ name: 'A', email: 'a@test.com', subject: 'S1', message: 'M1' });
    await contactService.create({ name: 'B', email: 'b@test.com', subject: 'S2', message: 'M2' });

    const page = await contactService.getAll({ page: 1, limit: 1 });
    expect(page.data.length).toBe(1);
    expect(page.pagination.total).toBeGreaterThanOrEqual(2);
    expect(page.pagination.totalPages).toBeGreaterThanOrEqual(2);
  });
});
