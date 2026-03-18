import { eq, desc, isNull, ilike, and, ne, count } from 'drizzle-orm';
import { db } from '../db';
import { posts } from '../db/schema';
import { blockService } from './blockService';
import { storageService } from './storageService';
import { ConflictError, NotFoundError } from '../lib/errors';
import { generateSlug } from '@buro710/shared';
import type {
  Post,
  PostStatus,
  PaginatedResponse,
  PostPaginationParams,
  PostHero,
} from '../types/post';
import type { Block } from '../types/block';

interface CreatePostParams extends PostHero {
  title: string;
  slug: string;
  status?: PostStatus;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  gallery_images?: string[];
  blocks?: {
    type: Block['type'];
    data: Block['data'];
    sort_order?: number;
  }[];
}

interface UpdatePostParams extends Partial<PostHero> {
  title?: string;
  slug?: string;
  status?: PostStatus;
  featured?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  gallery_images?: string[];
  blocks?: {
    id?: string;
    type: Block['type'];
    data: Block['data'];
    sort_order: number;
  }[];
}

function toPost(row: typeof posts.$inferSelect): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    status: row.status as PostStatus,
    featured: row.featured ?? undefined,
    seo_title: row.seo_title ?? undefined,
    seo_description: row.seo_description ?? undefined,
    og_image_url: row.og_image_url ?? undefined,
    hero_image_url: row.hero_image_url ?? undefined,
    hero_title: row.hero_title ?? undefined,
    hero_subtitle: row.hero_subtitle ?? undefined,
    hero_tags: row.hero_tags ?? undefined,
    hero_location: row.hero_location ?? undefined,
    hero_year: row.hero_year ?? undefined,
    gallery_images: row.gallery_images ?? undefined,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
    deleted_at: row.deleted_at?.toISOString() ?? null,
  };
}

export const postService = {
  getAll: async (params?: PostPaginationParams): Promise<PaginatedResponse<Post>> => {
    const { page = 1, limit = 10, status, search } = params || {};

    const conditions = [isNull(posts.deleted_at)];

    if (status) {
      conditions.push(eq(posts.status, status));
    }

    if (search) {
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      conditions.push(ilike(posts.title, `%${sanitizedSearch}%`));
    }

    const where = and(...conditions);
    const from = (page - 1) * limit;

    const [countResult, dataResult] = await Promise.all([
      db.select({ count: count() }).from(posts).where(where),
      db
        .select()
        .from(posts)
        .where(where)
        .orderBy(desc(posts.created_at))
        .limit(limit)
        .offset(from),
    ]);

    const total = countResult[0]?.count || 0;

    return {
      data: dataResult.map(toPost),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (id: string): Promise<{ post: Post; blocks: Block[] }> => {
    const [postResult, blocksList] = await Promise.all([
      db.select().from(posts).where(eq(posts.id, id)),
      blockService.getByPostId(id),
    ]);

    if (postResult.length === 0) throw new NotFoundError('Post not found');

    return { post: toPost(postResult[0]), blocks: blocksList };
  },

  getBySlug: async (slug: string): Promise<{ post: Post; blocks: Block[] }> => {
    const result = await db
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, 'published'), isNull(posts.deleted_at)));

    if (result.length === 0) throw new NotFoundError('Post not found');

    const blocksList = await blockService.getByPostId(result[0].id);

    return { post: toPost(result[0]), blocks: blocksList };
  },

  create: async (params: CreatePostParams): Promise<Post> => {
    const slug = params.slug || generateSlug(params.title);

    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, uniqueSlug), isNull(posts.deleted_at)));

      if (existing.length === 0) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const { blocks: blockData, ...postData } = params;

    const [post] = await db
      .insert(posts)
      .values({
        ...postData,
        slug: uniqueSlug,
        status: params.status || 'draft',
      })
      .returning();

    if (!post) throw new NotFoundError('Failed to create post');

    if (blockData && blockData.length > 0) {
      await blockService.create({ postId: post.id, blocks: blockData });
    }

    return toPost(post);
  },

  update: async (id: string, params: UpdatePostParams): Promise<Post> => {
    const { blocks: blockData, ...postData } = params;

    if (postData.slug) {
      const existing = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, postData.slug), ne(posts.id, id), isNull(posts.deleted_at)));

      if (existing.length > 0) {
        throw new ConflictError('Slug already exists');
      }
    }

    const [post] = await db
      .update(posts)
      .set({ ...postData, updated_at: new Date() })
      .where(eq(posts.id, id))
      .returning();

    if (!post) throw new NotFoundError('Failed to update post');

    if (blockData !== undefined) {
      await blockService.syncBlocks(id, blockData);
    }

    return toPost(post);
  },

  delete: async (id: string): Promise<void> => {
    await db
      .update(posts)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(posts.id, id));
  },

  restore: async (id: string): Promise<Post> => {
    const [post] = await db
      .update(posts)
      .set({ deleted_at: null, updated_at: new Date() })
      .where(eq(posts.id, id))
      .returning();

    if (!post) throw new NotFoundError('Post not found');

    return toPost(post);
  },

  permanentDelete: async (id: string): Promise<void> => {
    const postResult = await db
      .select({ hero_image_url: posts.hero_image_url, gallery_images: posts.gallery_images })
      .from(posts)
      .where(eq(posts.id, id));

    const blocksList = await blockService.getByPostId(id);

    const imageUrls: string[] = [];

    if (postResult[0]?.hero_image_url) {
      imageUrls.push(postResult[0].hero_image_url);
    }

    if (postResult[0]?.gallery_images && Array.isArray(postResult[0].gallery_images)) {
      imageUrls.push(...postResult[0].gallery_images.filter((url): url is string => !!url));
    }

    for (const block of blocksList) {
      if ('image_url' in block.data && block.data.image_url) {
        imageUrls.push(block.data.image_url as string);
      }
    }

    if (imageUrls.length > 0) {
      await storageService.deleteImages(imageUrls);
    }

    await db.delete(posts).where(eq(posts.id, id));
  },

  getFeatured: async (): Promise<Post[]> => {
    const result = await db
      .select()
      .from(posts)
      .where(and(eq(posts.featured, true), eq(posts.status, 'published'), isNull(posts.deleted_at)))
      .orderBy(desc(posts.created_at))
      .limit(6);

    return result.map(toPost);
  },

  generateSlug,
};
