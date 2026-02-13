import { Router } from 'express';
import type { Request } from 'express';
import { authMiddleware } from '../middleware/auth';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadBlockMedia } from '../middleware/multer';
import { supabase } from '../config/supabase';
import type { BlockType, BlockData } from '../../types/block';

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    id: string;
  };
}

const router = Router();

const VALIDATION_LIMITS = {
  title: { minLength: 1, maxLength: 200 },
  slug: { maxLength: 200 },
  seoTitle: { maxLength: 60 },
  seoDescription: { maxLength: 160 },
};

interface ValidationError {
  field: string;
  message: string;
}

const validatePostInput = (data: {
  title?: string;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { title, slug, seo_title, seo_description } = data;

  if (title !== undefined) {
    if (title.length < VALIDATION_LIMITS.title.minLength) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > VALIDATION_LIMITS.title.maxLength) {
      errors.push({ field: 'title', message: `Title must be at most ${VALIDATION_LIMITS.title.maxLength} characters` });
    }
  }

  if (slug && slug.length > VALIDATION_LIMITS.slug.maxLength) {
    errors.push({ field: 'slug', message: `Slug must be at most ${VALIDATION_LIMITS.slug.maxLength} characters` });
  }

  if (seo_title && seo_title.length > VALIDATION_LIMITS.seoTitle.maxLength) {
    errors.push({ field: 'seo_title', message: `SEO title must be at most ${VALIDATION_LIMITS.seoTitle.maxLength} characters` });
  }

  if (seo_description && seo_description.length > VALIDATION_LIMITS.seoDescription.maxLength) {
    errors.push({ field: 'seo_description', message: `SEO description must be at most ${VALIDATION_LIMITS.seoDescription.maxLength} characters` });
  }

  return errors;
};

router.get('/', async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;

    const result = await postService.getAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as 'draft' | 'published',
      search: search as string,
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const result = await postService.getBySlug(slug);
    res.json(result);
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    res.status(404).json({ error: 'Post not found' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await postService.getById(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(404).json({ error: 'Post not found' });
  }
});

router.post('/', authMiddleware, uploadBlockMedia, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, slug, status, seo_title, seo_description, blocks } = req.body as {
      title?: string;
      slug?: string;
      status?: 'draft' | 'published';
      seo_title?: string;
      seo_description?: string;
      blocks?: string;
    };

    const validationErrors = validatePostInput({ title, slug, seo_title, seo_description });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let ogImageUrl: string | undefined;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.['ogImage']?.[0]) {
      ogImageUrl = await storageService.uploadImage(files['ogImage'][0], 'blocks');
    }

    let parsedBlocks: { type: BlockType; data: Record<string, unknown>; sort_order?: number }[] = [];
    if (blocks) {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch {
        return res.status(400).json({ error: 'Invalid blocks format' });
      }
    }

    const blockImageFiles = files?.['blockImages'] || [];
    const blockUploads: { sort_order: number; file: Express.Multer.File }[] = [];
    let blockImageIndex = 0;

    const processedBlocks = parsedBlocks.map((block, index) => {
      const data = { ...block.data };
      const needsImage = block.type === 'image_full' || block.type === 'text_image' || block.type === 'image_text';
      const hasNewImage = data._hasNewImage === true;
      
      if (needsImage && hasNewImage && blockImageFiles[blockImageIndex]) {
        blockUploads.push({ sort_order: index, file: blockImageFiles[blockImageIndex] });
        blockImageIndex++;
      }
      delete data._hasNewImage;
      
      return {
        type: block.type,
        data,
        sort_order: block.sort_order ?? index,
      };
    });

    const post = await postService.create({
      title,
      slug: slug || postService.generateSlug(title),
      status,
      seo_title,
      seo_description,
      og_image_url: ogImageUrl,
      blocks: processedBlocks as unknown as { type: BlockType; data: BlockData; sort_order: number }[],
    });

    for (const upload of blockUploads) {
      const imageUrl = await storageService.uploadImage(upload.file, 'blocks');
      
      const { data: blockRecord } = await supabase
        .from('blocks')
        .select('id')
        .eq('post_id', post.id)
        .eq('sort_order', upload.sort_order)
        .single();

      if (blockRecord) {
        const block = processedBlocks[upload.sort_order];
        await supabase
          .from('blocks')
          .update({ data: { ...block.data, image_url: imageUrl } })
          .eq('id', blockRecord.id);
      }
    }

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'create',
      entity_type: 'post',
      entity_id: post.id,
      entity_title: post.title,
      changes: { blocks_count: parsedBlocks.length },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', authMiddleware, uploadBlockMedia, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const { title, slug, status, seo_title, seo_description, blocks } = req.body as {
      title?: string;
      slug?: string;
      status?: 'draft' | 'published';
      seo_title?: string;
      seo_description?: string;
      blocks?: string;
    };

    const validationErrors = validatePostInput({ title, slug, seo_title, seo_description });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existing = await postService.getById(id);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let ogImageUrl = existing.post.og_image_url;
    if (files?.['ogImage']?.[0]) {
      if (ogImageUrl) {
        await storageService.deleteImage(ogImageUrl);
      }
      ogImageUrl = await storageService.uploadImage(files['ogImage'][0], 'blocks');
    }

    let parsedBlocks: { id?: string; type: BlockType; data: Record<string, unknown>; sort_order: number }[] | undefined;
    if (blocks) {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch {
        return res.status(400).json({ error: 'Invalid blocks format' });
      }
    }

    const blockImageFiles = files?.['blockImages'] || [];
    const blockImageUrls: Record<number, string> = {};

    if (parsedBlocks && blockImageFiles.length > 0) {
      let blockImageIndex = 0;
      for (const block of parsedBlocks) {
        const needsImage = block.type === 'image_full' || block.type === 'text_image' || block.type === 'image_text';
        const hasNewImage = block.data._hasNewImage === true;
        
        if (needsImage && hasNewImage && blockImageFiles[blockImageIndex]) {
          blockImageUrls[block.sort_order] = await storageService.uploadImage(blockImageFiles[blockImageIndex], 'blocks');
          blockImageIndex++;
        }
        delete block.data._hasNewImage;
      }
    }

    if (parsedBlocks) {
      parsedBlocks = parsedBlocks.map(block => {
        if (blockImageUrls[block.sort_order]) {
          return {
            ...block,
            data: { ...block.data, image_url: blockImageUrls[block.sort_order] },
          };
        }
        return block;
      });
    }

    const changedFields: string[] = [];
    if (title !== undefined && title !== existing.post.title) changedFields.push('title');
    if (slug !== undefined && slug !== existing.post.slug) changedFields.push('slug');
    if (status !== undefined && status !== existing.post.status) changedFields.push('status');
    if (ogImageUrl !== existing.post.og_image_url) changedFields.push('og_image');

    const post = await postService.update(id, {
      title,
      slug,
      status,
      seo_title,
      seo_description,
      og_image_url: ogImageUrl,
      blocks: parsedBlocks as unknown as { id?: string; type: BlockType; data: BlockData; sort_order: number }[],
    });

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'update',
      entity_type: 'post',
      entity_id: id,
      entity_title: post.title,
      changes: { fields: changedFields.length > 0 ? changedFields : undefined, blocks_count: parsedBlocks?.length },
    });

    res.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const result = await postService.getById(id);

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'delete',
      entity_type: 'post',
      entity_id: id,
      entity_title: result.post.title,
      changes: {},
    });

    await postService.delete(id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
