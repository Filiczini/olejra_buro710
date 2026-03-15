import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { logger } from '../lib/logger';
import type { AuthenticatedRequest } from '../types/express.js';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadBlockMedia, uploadGalleryImages } from '../middleware/multer';
import { supabase } from '../config/supabase';
import type { BlockType, BlockData } from '../types/block';
import {
  validatePostInput,
  parseBlocksJson,
  extractBlockImageUploads,
  type PostBody,
} from './api/posts.validation';

const router = Router();

const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(adminRateLimiter);

router.get('/', async (req, res) => {
  try {
    const { page, limit, status, search } = req.query;

    const parsedPage = page ? Math.max(1, parseInt(page as string, 10) || 1) : undefined;
    const parsedLimit = limit
      ? Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10))
      : undefined;

    const result = await postService.getAll({
      page: parsedPage,
      limit: parsedLimit,
      status: status as 'draft' | 'published',
      search: search ? String(search).slice(0, 200) : undefined,
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/featured', async (_req, res) => {
  try {
    const posts = await postService.getFeatured();
    res.json(posts);
  } catch (error) {
    logger.error('Error fetching featured posts:', error);
    res.status(500).json({ error: 'Failed to fetch featured posts' });
  }
});

router.get('/public/:slug', async (req, res) => {
  try {
    const slug = req.params.slug as string;
    const result = await postService.getBySlug(slug);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching post by slug:', error);
    res.status(404).json({ error: 'Post not found' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await postService.getById(id);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(404).json({ error: 'Post not found' });
  }
});

router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  uploadBlockMedia,
  async (req: AuthenticatedRequest, res) => {
    try {
      const body = req.body as PostBody;
      const {
        title,
        slug,
        status,
        featured,
        seo_title,
        seo_description,
        hero_title,
        hero_subtitle,
        hero_tags,
        hero_location,
        hero_year,
        gallery_images,
        blocks,
      } = body;

      const validationErrors = validatePostInput(body, true);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
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

      const rawBlocks = parseBlocksJson(blocks);
      const blockImageFiles = files?.['blockImages'] || [];
      const { blocks: processedBlocks, uploads: blockUploads } = extractBlockImageUploads(
        rawBlocks,
        blockImageFiles
      );

      const galleryImageFiles = files?.['galleryImages'] || [];
      const existingGalleryUrls = gallery_images ? JSON.parse(gallery_images) : [];
      const newGalleryUrls = await Promise.all(
        galleryImageFiles.map((file) => storageService.uploadImage(file, 'blocks'))
      );

      const finalGalleryImages = [...existingGalleryUrls, ...newGalleryUrls];

      const post = await postService.create({
        title,
        slug: slug || postService.generateSlug(title),
        status,
        featured: featured === 'true',
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
        blocks: processedBlocks as unknown as {
          type: BlockType;
          data: BlockData;
          sort_order: number;
        }[],
      });

      if (blockUploads.length > 0) {
        // Prefetch all blocks once to avoid N+1 queries
        const { data: allBlocks } = await supabase
          .from('blocks')
          .select('id, data, sort_order')
          .eq('post_id', post.id);

        const blocksByOrder = new Map((allBlocks || []).map((b) => [b.sort_order, b]));

        await Promise.all(
          blockUploads.map(async (upload) => {
            const imageUrl = await storageService.uploadImage(upload.file, 'blocks');
            const blockRecord = blocksByOrder.get(upload.sort_order);

            if (blockRecord) {
              const currentData = (blockRecord.data as Record<string, unknown>) || {};
              if (upload.imageSlot !== undefined) {
                const images = [...((currentData.images as { url: string; alt: string }[]) || [])];
                images[upload.imageSlot] = { ...images[upload.imageSlot], url: imageUrl };
                await supabase
                  .from('blocks')
                  .update({ data: { ...currentData, images } })
                  .eq('id', blockRecord.id);
              } else {
                await supabase
                  .from('blocks')
                  .update({ data: { ...currentData, image_url: imageUrl } })
                  .eq('id', blockRecord.id);
              }
            }
          })
        );
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
          blocks_count: rawBlocks.length,
          hero_updated: heroFields.length > 0,
          hero_fields: heroFields.length > 0 ? heroFields : undefined,
        },
      });

      res.status(201).json(post);
    } catch (error) {
      logger.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  uploadBlockMedia,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id as string;
      const body = req.body as PostBody;
      const {
        title,
        slug,
        status,
        featured,
        seo_title,
        seo_description,
        hero_title,
        hero_subtitle,
        hero_tags,
        hero_location,
        hero_year,
        gallery_images,
        blocks,
      } = body;

      const validationErrors = validatePostInput(body, false);
      if (validationErrors.length > 0) {
        return res.status(400).json({ error: 'Validation failed', details: validationErrors });
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

      const rawBlocks = blocks ? parseBlocksJson(blocks) : undefined;
      const blockImageFiles = files?.['blockImages'] || [];

      const extracted = rawBlocks
        ? extractBlockImageUploads(rawBlocks, blockImageFiles)
        : { blocks: undefined, uploads: [] };
      let parsedBlocks = extracted.blocks;
      const blockUploadsForUpdate = extracted.uploads;

      // Upload block images in parallel and apply URLs to block data
      const blockUploadResults = await Promise.all(
        blockUploadsForUpdate.map(async (upload) => ({
          sort_order: upload.sort_order,
          url: await storageService.uploadImage(upload.file, 'blocks'),
          slot: upload.imageSlot,
        }))
      );
      const blockImageUploads: Record<number, { url: string; slot?: number }[]> = {};
      for (const result of blockUploadResults) {
        if (!blockImageUploads[result.sort_order]) blockImageUploads[result.sort_order] = [];
        blockImageUploads[result.sort_order].push({ url: result.url, slot: result.slot });
      }

      if (parsedBlocks) {
        parsedBlocks = parsedBlocks.map((block) => {
          const uploads = blockImageUploads[block.sort_order];
          if (!uploads) return block;

          const data = { ...block.data };
          for (const upload of uploads) {
            if (upload.slot !== undefined) {
              const images = [...((data.images as { url: string; alt: string }[]) || [])];
              images[upload.slot] = { ...images[upload.slot], url: upload.url };
              data.images = images;
            } else {
              data.image_url = upload.url;
            }
          }
          return { ...block, data };
        });
      }

      const galleryImageFiles = files?.['galleryImages'] || [];
      const existingGalleryUrls = gallery_images
        ? JSON.parse(gallery_images)
        : existing.post.gallery_images || [];
      const newGalleryUrls = await Promise.all(
        galleryImageFiles.map((file) => storageService.uploadImage(file, 'blocks'))
      );

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
        featured: featured !== undefined ? featured === 'true' : undefined,
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
        blocks: parsedBlocks as unknown as {
          id?: string;
          type: BlockType;
          data: BlockData;
          sort_order: number;
        }[],
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
      logger.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }
);

router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res) => {
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
    logger.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

router.post(
  '/:id/gallery',
  authMiddleware,
  adminMiddleware,
  uploadGalleryImages,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id as string;
      const files = req.files as Express.Multer.File[] | undefined;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const existing = await postService.getById(id);
      const currentGallery = existing.post.gallery_images || [];

      const uploadPromises = files.map((file) => storageService.uploadImage(file, 'blocks'));
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
      logger.error('Error uploading gallery images:', error);
      res.status(500).json({ error: 'Failed to upload gallery images' });
    }
  }
);

router.delete(
  '/:id/gallery',
  authMiddleware,
  adminMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const id = req.params.id as string;
      const { image_url } = req.body as { image_url?: string };

      if (!image_url || typeof image_url !== 'string') {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      try {
        new URL(image_url);
      } catch {
        return res.status(400).json({ error: 'Invalid image URL format' });
      }

      const existing = await postService.getById(id);
      const currentGallery = existing.post.gallery_images || [];

      const updatedGallery = currentGallery.filter((url) => url !== image_url);

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
      logger.error('Error deleting gallery image:', error);
      res.status(500).json({ error: 'Failed to delete gallery image' });
    }
  }
);

export default router;
