import { supabase } from '../config/supabase';
import { blockService } from './blockService';
import { storageService } from './storageService';
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

function generateSlug(title: string): string {
  const transliterate = (str: string): string => {
    const map: Record<string, string> = {
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'h',
      ґ: 'g',
      д: 'd',
      е: 'e',
      є: 'ye',
      ж: 'zh',
      з: 'z',
      и: 'y',
      і: 'i',
      ї: 'yi',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'kh',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ь: '',
      ю: 'yu',
      я: 'ya',
    };
    return str
      .toLowerCase()
      .split('')
      .map((char) => map[char] || char)
      .join('');
  };

  return transliterate(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const postService = {
  getAll: async (params?: PostPaginationParams): Promise<PaginatedResponse<Post>> => {
    const { page = 1, limit = 10, status, search } = params || {};

    let query = supabase.from('posts').select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as Post[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  },

  getById: async (id: string): Promise<{ post: Post; blocks: Block[] }> => {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) throw postError;

    const blocks = await blockService.getByPostId(id);

    return { post: post as Post, blocks };
  },

  getBySlug: async (slug: string): Promise<{ post: Post; blocks: Block[] }> => {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (postError) throw postError;

    const blocks = await blockService.getByPostId(post.id);

    return { post: post as Post, blocks };
  },

  create: async (params: CreatePostParams): Promise<Post> => {
    const slug = params.slug || generateSlug(params.title);

    let uniqueSlug = slug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();

      if (!existing) break;
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const { blocks, ...postData } = params;

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        ...postData,
        slug: uniqueSlug,
        status: params.status || 'draft',
      })
      .select()
      .single();

    if (postError) throw postError;
    if (!post) throw new Error('Failed to create post');

    if (blocks && blocks.length > 0) {
      await blockService.create({ postId: post.id, blocks });
    }

    return post as Post;
  },

  update: async (id: string, params: UpdatePostParams): Promise<Post> => {
    const { blocks, ...postData } = params;

    if (postData.slug) {
      const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', postData.slug)
        .neq('id', id)
        .single();

      if (existing) {
        throw new Error('Slug already exists');
      }
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single();

    if (postError) throw postError;
    if (!post) throw new Error('Failed to update post');

    if (blocks !== undefined) {
      await blockService.syncBlocks(id, blocks);
    }

    return post as Post;
  },

  delete: async (id: string): Promise<void> => {
    const { data: post } = await supabase
      .from('posts')
      .select('hero_image_url, gallery_images')
      .eq('id', id)
      .single();

    const blocks = await blockService.getByPostId(id);

    const imageUrls: string[] = [];

    if (post?.hero_image_url) {
      imageUrls.push(post.hero_image_url);
    }

    if (post?.gallery_images && Array.isArray(post.gallery_images)) {
      imageUrls.push(...post.gallery_images.filter((url): url is string => !!url));
    }

    for (const block of blocks) {
      if ('image_url' in block.data && block.data.image_url) {
        imageUrls.push(block.data.image_url);
      }
    }

    if (imageUrls.length > 0) {
      await storageService.deleteImages(imageUrls);
    }

    await supabase.from('posts').delete().eq('id', id);
  },

  getFeatured: async (): Promise<Post[]> => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) throw error;
    return (data || []) as Post[];
  },

  generateSlug,
};
