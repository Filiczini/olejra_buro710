import { Router } from 'express';
import type { Request } from 'express';
import { authMiddleware } from '../middleware/auth';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { supabase } from '../config/supabase';
import type { BlockType, BlockData } from '../types/block';

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    id: string;
  };
}

interface PostBody {
  title?: string;
  slug?: string;
  status?: 'draft' | 'published';
  seo_title?: string;
  seo_description?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_tags?: string;
  hero_location?: string;
  hero_year?: string;
  gallery_images?: string;
  blocks?: string;
}

const router = Router();

const VALIDATION_LIMITS = {
  title: { minLength: 1, maxLength: 200 },
  slug: { maxLength: 200 },
  seoTitle: { maxLength: 60 },
  seoDescription: { maxLength: 160 },
  heroTitle: { maxLength: 200 },
  heroSubtitle: { maxLength: 300 },
};

interface ValidationError {
  field: string;
  message: string;
}

const validatePostInput = (data: PostBody): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { title, slug, seo_title, seo_description, hero_title, hero_subtitle } = data;

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

  if (hero_title && hero_title.length > VALIDATION_LIMITS.heroTitle.maxLength) {
    errors.push({ field: 'hero_title', message: `Hero title must be at most ${VALIDATION_LIMITS.heroTitle.maxLength} characters` });
  }

  if (hero_subtitle && hero_subtitle.length > VALIDATION_LIMITS.heroSubtitle.maxLength) {
    errors.push({ field: 'hero_subtitle', message: `Hero subtitle must be at most ${VALIDATION_LIMITS.heroSubtitle.maxLength} characters` });
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

router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const body = req.body as PostBody;
    const { title, slug, status, seo_title, seo_description, hero_title, hero_subtitle, hero_tags, hero_location, hero_year, gallery_images, blocks } = body;

    const validationErrors = validatePostInput(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let heroImageUrl: string | undefined;
    if (files?.['heroImage']?.[0]) {
      heroImageUrl = await storageService.uploadImage(files['heroImage'][0], 'blocks');
    }

    let ogImageUrl: string | undefined;
    if (files?.['ogImage']?.[0]) {
      ogImageUrl = await storageService.uploadImage(files['ogImage'][0], 'blocks');
    }

    let parsedBlocks: { id?: string; _tempId?: string; type: BlockType; data: Record<string, unknown>; sort_order?: number }[] = [];
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
        id: block.id,
        type: block.type,
        data,
        sort_order: block.sort_order ?? index,
      };
    });

    const galleryImageFiles = files?.['galleryImages'] || [];
    const existingGalleryUrls = gallery_images ? JSON.parse(gallery_images) : [];
    const newGalleryUrls: string[] = [];
    
    for (const file of galleryImageFiles) {
      const url = await storageService.uploadImage(file, 'blocks');
      newGalleryUrls.push(url);
    }
    
    const finalGalleryImages = [...existingGalleryUrls, ...newGalleryUrls];

    const post = await postService.create({
      title,
      slug: slug || postService.generateSlug(title),
      status,
      seo_title,
      seo_description,
      og_image_url: ogImageUrl,
      hero_image_url: heroImageUrl,
      hero_title,
      hero_subtitle,
      hero_tags: hero_tags ? JSON.parse(hero_tags) : [],
      hero_location,
      hero_year,
      gallery_images: finalGalleryImages,
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

    const heroFields: string[] = [];
    if (heroImageUrl) heroFields.push('hero_image');
    if (hero_title) heroFields.push('hero_title');
    if (hero_subtitle) heroFields.push('hero_subtitle');
    if (hero_tags) heroFields.push('hero_tags');
    if (hero_location) heroFields.push('hero_location');
    if (hero_year) heroFields.push('hero_year');

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'create',
      entity_type: 'post',
      entity_id: post.id,
      entity_title: post.title,
      changes: { 
        blocks_count: parsedBlocks.length,
        hero_updated: heroFields.length > 0,
        hero_fields: heroFields.length > 0 ? heroFields : undefined,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const body = req.body as PostBody;
    const { title, slug, status, seo_title, seo_description, hero_title, hero_subtitle, hero_tags, hero_location, hero_year, gallery_images, blocks } = body;

    const validationErrors = validatePostInput(body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existing = await postService.getById(id);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    let heroImageUrl = existing.post.hero_image_url;
    if (files?.['heroImage']?.[0]) {
      if (heroImageUrl) {
        await storageService.deleteImage(heroImageUrl);
      }
      heroImageUrl = await storageService.uploadImage(files['heroImage'][0], 'blocks');
    }

    let ogImageUrl = existing.post.og_image_url;
    if (files?.['ogImage']?.[0]) {
      if (ogImageUrl) {
        await storageService.deleteImage(ogImageUrl);
      }
      ogImageUrl = await storageService.uploadImage(files['ogImage'][0], 'blocks');
    }

    let parsedBlocks: { id?: string; _tempId?: string; type: BlockType; data: Record<string, unknown>; sort_order: number }[] | undefined;
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

    const galleryImageFiles = files?.['galleryImages'] || [];
    const existingGalleryUrls = gallery_images ? JSON.parse(gallery_images) : existing.post.gallery_images || [];
    const newGalleryUrls: string[] = [];
    
    for (const file of galleryImageFiles) {
      const url = await storageService.uploadImage(file, 'blocks');
      newGalleryUrls.push(url);
    }
    
    const finalGalleryImages = [...existingGalleryUrls, ...newGalleryUrls];

    const changedFields: string[] = [];
    if (title !== undefined && title !== existing.post.title) changedFields.push('title');
    if (slug !== undefined && slug !== existing.post.slug) changedFields.push('slug');
    if (status !== undefined && status !== existing.post.status) changedFields.push('status');

    const heroFields: string[] = [];
    if (heroImageUrl !== existing.post.hero_image_url) heroFields.push('hero_image');
    if (hero_title !== existing.post.hero_title) heroFields.push('hero_title');
    if (hero_subtitle !== existing.post.hero_subtitle) heroFields.push('hero_subtitle');
    const newHeroTags = hero_tags ? JSON.parse(hero_tags) : [];
    const oldHeroTags = existing.post.hero_tags || [];
    if (JSON.stringify(newHeroTags) !== JSON.stringify(oldHeroTags)) heroFields.push('hero_tags');
    if (hero_location !== existing.post.hero_location) heroFields.push('hero_location');
    if (hero_year !== existing.post.hero_year) heroFields.push('hero_year');

    const post = await postService.update(id, {
      title,
      slug,
      status,
      seo_title,
      seo_description,
      og_image_url: ogImageUrl,
      hero_image_url: heroImageUrl,
      hero_title,
      hero_subtitle,
      hero_tags: hero_tags ? JSON.parse(hero_tags) : undefined,
      hero_location,
      hero_year,
      gallery_images: finalGalleryImages,
      blocks: parsedBlocks as unknown as { id?: string; type: BlockType; data: BlockData; sort_order: number }[],
    });

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'update',
      entity_type: 'post',
      entity_id: id,
      entity_title: post.title,
      changes: { 
        fields: changedFields.length > 0 ? changedFields : undefined, 
        blocks_count: parsedBlocks?.length,
        hero_updated: heroFields.length > 0,
        hero_fields: heroFields.length > 0 ? heroFields : undefined,
      },
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

router.post('/:id/gallery', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const existing = await postService.getById(id);
    const currentGallery = existing.post.gallery_images || [];

    const uploadPromises = files.map(file => storageService.uploadImage(file, 'blocks'));
    const newUrls = await Promise.all(uploadPromises);

    const updatedGallery = [...currentGallery, ...newUrls];

    await postService.update(id, { gallery_images: updatedGallery });

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'update',
      entity_type: 'post',
      entity_id: id,
      entity_title: existing.post.title,
      changes: { 
        gallery_updated: true,
        gallery_count: updatedGallery.length,
      },
    });

    res.json({ gallery_images: updatedGallery, new_images: newUrls });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

router.delete('/:id/gallery', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;
    const { image_url } = req.body as { image_url?: string };

    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const existing = await postService.getById(id);
    const currentGallery = existing.post.gallery_images || [];

    const updatedGallery = currentGallery.filter(url => url !== image_url);

    if (updatedGallery.length !== currentGallery.length) {
      await storageService.deleteImage(image_url);
      await postService.update(id, { gallery_images: updatedGallery });

      await activityLogService.log({
        user_email: req.user?.email || 'unknown',
        action: 'update',
        entity_type: 'post',
        entity_id: id,
        entity_title: existing.post.title,
        changes: { 
          gallery_updated: true,
          gallery_count: updatedGallery.length,
        },
      });
    }

    res.json({ gallery_images: updatedGallery });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

export default router;
