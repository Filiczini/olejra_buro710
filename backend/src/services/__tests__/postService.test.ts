import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockReturning,
  mockUpdateWhere,
  mockUpdateSet,
  mockUpdateFn,
  mockInsertReturning,
  mockInsertValues,
  mockInsertFn,
  mockDeleteWhere,
  mockDeleteFn,
  mockSelectOffset,
  mockSelectLimit,
  mockSelectOrderBy,
  mockSelectWhere,
  mockSelectFrom,
  mockSelect,
} = vi.hoisted(() => {
  const mockReturning = vi.fn();
  const mockUpdateWhere = vi.fn(() => ({ returning: mockReturning }));
  const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdateFn = vi.fn(() => ({ set: mockUpdateSet }));

  const mockInsertReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
  const mockInsertFn = vi.fn(() => ({ values: mockInsertValues }));

  const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
  const mockDeleteFn = vi.fn(() => ({ where: mockDeleteWhere }));

  const mockSelectOffset = vi.fn();
  const mockSelectLimit = vi.fn(() => ({ offset: mockSelectOffset }));
  const mockSelectOrderBy = vi.fn(() => ({ limit: mockSelectLimit }));
  const mockSelectWhere = vi.fn(() => ({ orderBy: mockSelectOrderBy }));
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

  return {
    mockReturning,
    mockUpdateWhere,
    mockUpdateSet,
    mockUpdateFn,
    mockInsertReturning,
    mockInsertValues,
    mockInsertFn,
    mockDeleteWhere,
    mockDeleteFn,
    mockSelectOffset,
    mockSelectLimit,
    mockSelectOrderBy,
    mockSelectWhere,
    mockSelectFrom,
    mockSelect,
  };
});

vi.mock('../../db', () => ({
  db: {
    select: mockSelect,
    insert: mockInsertFn,
    update: mockUpdateFn,
    delete: mockDeleteFn,
  },
}));

vi.mock('../../db/schema', () => ({
  posts: {
    id: 'id',
    slug: 'slug',
    status: 'status',
    featured: 'featured',
    title: 'title',
    deleted_at: 'deleted_at',
    created_at: 'created_at',
    hero_image_url: 'hero_image_url',
    gallery_images: 'gallery_images',
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col, val) => ({ col, val, op: 'eq' })),
  ne: vi.fn((col, val) => ({ col, val, op: 'ne' })),
  desc: vi.fn((col) => col),
  isNull: vi.fn((col) => ({ col, op: 'isNull' })),
  ilike: vi.fn((col, val) => ({ col, val, op: 'ilike' })),
  and: vi.fn((...args: any[]) => ({ op: 'and', args })),
  count: vi.fn(() => 'count_fn'),
  sql: vi.fn(),
}));

vi.mock('../blockService', () => ({
  blockService: {
    getByPostId: vi.fn(),
    create: vi.fn(),
    syncBlocks: vi.fn(),
  },
}));

vi.mock('../storageService', () => ({
  storageService: {
    deleteImages: vi.fn().mockResolvedValue(undefined),
  },
}));

import { postService } from '../postService';
import { blockService } from '../blockService';
import { storageService } from '../storageService';

const mockedBlockService = vi.mocked(blockService);
const mockedStorageService = vi.mocked(storageService);

describe('postService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated posts with default params', async () => {
      const mockPosts = [
        {
          id: 'p1',
          title: 'Post 1',
          slug: 'post-1',
          status: 'published',
          featured: false,
          seo_title: null,
          seo_description: null,
          og_image_url: null,
          hero_image_url: null,
          hero_title: null,
          hero_subtitle: null,
          hero_tags: null,
          hero_location: null,
          hero_year: null,
          gallery_images: null,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          deleted_at: null,
        },
      ];

      // Count chain
      const countWhere = vi.fn().mockResolvedValue([{ count: 1 }]);
      const countFrom = vi.fn(() => ({ where: countWhere }));

      // Data chain
      const dataOffset = vi.fn().mockResolvedValue(mockPosts);
      const dataLimit = vi.fn(() => ({ offset: dataOffset }));
      const dataOrderBy = vi.fn(() => ({ limit: dataLimit }));
      const dataWhere = vi.fn(() => ({ orderBy: dataOrderBy }));
      const dataFrom = vi.fn(() => ({ where: dataWhere }));

      let callCount = 0;
      mockSelect.mockImplementation(() => {
        callCount++;
        return { from: callCount === 1 ? countFrom : dataFrom } as any;
      });

      const result = await postService.getAll();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('p1');
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('calculates correct pagination range', async () => {
      const mockOffset = vi.fn().mockResolvedValue([]);
      const mockLimitFn = vi.fn(() => ({ offset: mockOffset }));
      const dataOrderBy = vi.fn(() => ({ limit: mockLimitFn }));
      const dataWhere = vi.fn(() => ({ orderBy: dataOrderBy }));
      const dataFrom = vi.fn(() => ({ where: dataWhere }));

      const countWhere = vi.fn().mockResolvedValue([{ count: 25 }]);
      const countFrom = vi.fn(() => ({ where: countWhere }));

      let callCount = 0;
      mockSelect.mockImplementation(() => {
        callCount++;
        return { from: callCount === 1 ? countFrom : dataFrom } as any;
      });

      await postService.getAll({ page: 3, limit: 5 });

      expect(mockLimitFn).toHaveBeenCalledWith(5);
      expect(mockOffset).toHaveBeenCalledWith(10);
    });
  });

  describe('getById', () => {
    it('returns post with blocks', async () => {
      const mockPost = {
        id: 'p1',
        title: 'Post 1',
        slug: 'post-1',
        status: 'published',
        featured: false,
        seo_title: null,
        seo_description: null,
        og_image_url: null,
        hero_image_url: null,
        hero_title: null,
        hero_subtitle: null,
        hero_tags: null,
        hero_location: null,
        hero_year: null,
        gallery_images: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };
      const mockBlocks = [
        {
          id: 'b1',
          post_id: 'p1',
          type: 'text_full',
          data: { content: 'Hi' },
          sort_order: 0,
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      // select().from(posts).where(eq(posts.id, id)) — no orderBy
      const postWhere = vi.fn().mockResolvedValue([mockPost]);
      const postFrom = vi.fn(() => ({ where: postWhere }));

      mockSelect.mockReturnValue({ from: postFrom } as any);
      mockedBlockService.getByPostId.mockResolvedValue(mockBlocks as never);

      const result = await postService.getById('p1');

      expect(result.post.id).toBe('p1');
      expect(result.blocks).toEqual(mockBlocks);
    });

    it('throws when post is not found', async () => {
      const postWhere = vi.fn().mockResolvedValue([]);
      const postFrom = vi.fn(() => ({ where: postWhere }));
      mockSelect.mockReturnValue({ from: postFrom } as any);

      await expect(postService.getById('nonexistent')).rejects.toThrow('Post not found');
    });
  });

  describe('create', () => {
    it('creates a new post with generated slug', async () => {
      const mockPost = {
        id: 'p1',
        title: 'My New Post',
        slug: 'my-new-post',
        status: 'draft',
        featured: false,
        seo_title: null,
        seo_description: null,
        og_image_url: null,
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
        gallery_images: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };

      // Slug uniqueness check: select({id}).from(posts).where(...)
      const slugCheckWhere = vi.fn().mockResolvedValue([]);
      const slugCheckFrom = vi.fn(() => ({ where: slugCheckWhere }));

      mockSelect.mockReturnValue({ from: slugCheckFrom } as any);
      mockInsertReturning.mockResolvedValue([mockPost]);

      const result = await postService.create({
        title: 'My New Post',
        slug: 'my-new-post',
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
      });

      expect(result.id).toBe('p1');
      expect(result.title).toBe('My New Post');
    });

    it('creates blocks when provided', async () => {
      const mockPost = {
        id: 'p1',
        title: 'Post',
        slug: 'post',
        status: 'draft',
        featured: false,
        seo_title: null,
        seo_description: null,
        og_image_url: null,
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
        gallery_images: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };

      const slugCheckWhere = vi.fn().mockResolvedValue([]);
      const slugCheckFrom = vi.fn(() => ({ where: slugCheckWhere }));

      mockSelect.mockReturnValue({ from: slugCheckFrom } as any);
      mockInsertReturning.mockResolvedValue([mockPost]);
      mockedBlockService.create.mockResolvedValue([] as never);

      await postService.create({
        title: 'Post',
        slug: 'post',
        hero_image_url: '',
        hero_title: '',
        hero_subtitle: '',
        hero_tags: [],
        hero_location: '',
        hero_year: '',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });

      expect(mockedBlockService.create).toHaveBeenCalledWith({
        postId: 'p1',
        blocks: [{ type: 'text_full', data: { content: 'Hello' } }],
      });
    });
  });

  describe('update', () => {
    it('updates an existing post', async () => {
      const mockPost = {
        id: 'p1',
        title: 'Updated',
        slug: 'updated',
        status: 'draft',
        featured: false,
        seo_title: null,
        seo_description: null,
        og_image_url: null,
        hero_image_url: null,
        hero_title: null,
        hero_subtitle: null,
        hero_tags: null,
        hero_location: null,
        hero_year: null,
        gallery_images: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };

      mockReturning.mockResolvedValue([mockPost]);

      const result = await postService.update('p1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('syncs blocks when blocks are provided', async () => {
      const mockPost = {
        id: 'p1',
        title: 'Post',
        slug: 'post',
        status: 'draft',
        featured: false,
        seo_title: null,
        seo_description: null,
        og_image_url: null,
        hero_image_url: null,
        hero_title: null,
        hero_subtitle: null,
        hero_tags: null,
        hero_location: null,
        hero_year: null,
        gallery_images: null,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        deleted_at: null,
      };

      mockReturning.mockResolvedValue([mockPost]);
      mockedBlockService.syncBlocks.mockResolvedValue([] as never);

      const blocks = [
        { id: 'b1', type: 'text_full' as const, data: { content: 'Updated' }, sort_order: 0 },
      ];

      await postService.update('p1', { blocks });

      expect(mockedBlockService.syncBlocks).toHaveBeenCalledWith('p1', blocks);
    });

    it('checks for slug uniqueness when slug is updated', async () => {
      // Slug check returns existing post
      const slugCheckWhere = vi.fn().mockResolvedValue([{ id: 'other-post' }]);
      const slugCheckFrom = vi.fn(() => ({ where: slugCheckWhere }));
      mockSelect.mockReturnValue({ from: slugCheckFrom } as any);

      await expect(postService.update('p1', { slug: 'taken-slug' })).rejects.toThrow(
        'Slug already exists'
      );
    });
  });

  describe('delete (soft)', () => {
    it('sets deleted_at instead of removing the post', async () => {
      mockReturning.mockResolvedValue([]);

      await postService.delete('p1');

      expect(mockUpdateSet).toHaveBeenCalledWith(
        expect.objectContaining({ deleted_at: expect.any(Date) })
      );
      expect(mockedStorageService.deleteImages).not.toHaveBeenCalled();
    });
  });

  describe('generateSlug', () => {
    it('creates a valid slug from an English title', () => {
      expect(postService.generateSlug('Hello World')).toBe('hello-world');
    });

    it('removes special characters', () => {
      expect(postService.generateSlug('Hello, World!')).toBe('hello-world');
    });

    it('strips leading and trailing hyphens', () => {
      expect(postService.generateSlug('--Hello World--')).toBe('hello-world');
    });

    it('transliterates Ukrainian characters', () => {
      expect(postService.generateSlug('Привіт Світ')).toBe('pryvit-svit');
    });

    it('handles mixed Latin and Cyrillic', () => {
      const slug = postService.generateSlug('Design Проект');
      expect(slug).toBe('design-proekt');
    });

    it('collapses multiple consecutive special characters into single hyphen', () => {
      expect(postService.generateSlug('hello   world')).toBe('hello-world');
    });
  });
});
