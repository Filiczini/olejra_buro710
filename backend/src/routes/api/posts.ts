/**
 * External API v1 Routes - Posts
 * CRUD operations for posts, protected by API Key authentication
 * Supports both JSON and multipart/form-data requests
 */
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { activityLogService } from '../../services/activityLogService';
import { apiKeyMiddleware } from '../../middleware/apiKey';
import { uploadMiddleware } from '../../middleware/multer';
import { postService } from '../../services/postService';
import { storageService } from '../../services/storageService';
import type { BlockType, BlockData, PostStatus } from '@buro710/shared';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
  parseJsonField,
  processBlocks,
  validatePostInput,
  type PostBody,
  type ProcessedBlock,
} from './posts.validation';

const router = Router();

const uploadPostMedia = uploadMiddleware.fields([
  { name: 'hero_image', maxCount: 1 },
  { name: 'og_image', maxCount: 1 },
  { name: 'gallery_images', maxCount: 20 },
]);

// ============================================================================
// Helper Functions
// ============================================================================

export interface ProcessedFiles {
  heroImageUrl?: string;
  ogImageUrl?: string;
  galleryUrls: string[];
}

export interface UrlOptions {
  hero_image_url?: string;
  og_image_url?: string;
}

export const processUploadedFiles = async (
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
  existingGallery: string[] = [],
  urls: UrlOptions = {}
): Promise<ProcessedFiles> => {
  const result: ProcessedFiles = { galleryUrls: existingGallery };

  if (!files) {
    // If no files, use URLs if provided
    if (urls.hero_image_url) {
      result.heroImageUrl = urls.hero_image_url;
    }
    if (urls.og_image_url) {
      result.ogImageUrl = urls.og_image_url;
    }
    return result;
  }

  // Hero image: file takes priority over URL
  if (files['hero_image']?.[0]) {
    result.heroImageUrl = await storageService.uploadImage(files['hero_image'][0], 'posts');
  } else if (urls.hero_image_url) {
    result.heroImageUrl = urls.hero_image_url;
  }

  // OG image: file takes priority over URL
  if (files['og_image']?.[0]) {
    result.ogImageUrl = await storageService.uploadImage(files['og_image'][0], 'posts');
  } else if (urls.og_image_url) {
    result.ogImageUrl = urls.og_image_url;
  }

  // Gallery (existing logic)
  const galleryFiles = files['gallery_images'] || [];
  const newGalleryUrls: string[] = [];

  for (const file of galleryFiles) {
    const url = await storageService.uploadImage(file, 'posts');
    newGalleryUrls.push(url);
  }

  result.galleryUrls = [...existingGallery, ...newGalleryUrls];

  return result;
};

// ============================================================================
// Routes - All protected by API Key
// ============================================================================

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(apiKeyMiddleware);
router.use(apiRateLimiter);

/**
 * GET /api/v1/posts
 * List posts with pagination and optional status filter
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, status, search } = req.query;

    const parsedPage = page ? Math.max(1, parseInt(page as string, 10) || 1) : undefined;
    const parsedLimit = limit
      ? Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10))
      : undefined;

    const result = await postService.getAll({
      page: parsedPage,
      limit: parsedLimit,
      status: status as PostStatus,
      search: search ? String(search).slice(0, 200) : undefined,
    });

    res.json(result);
  })
);

/**
 * GET /api/v1/posts/:id
 * Get a single post by ID with all blocks
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const result = await postService.getById(id);
    res.json(result);
  })
);

/**
 * POST /api/v1/posts
 * Create a new post (JSON or multipart/form-data)
 */
router.post(
  '/',
  uploadPostMedia,
  asyncHandler(async (req, res) => {
    const body = req.body as PostBody;
    const {
      title,
      slug,
      status,
      seo_title,
      seo_description,
      hero_title,
      hero_subtitle,
      hero_tags,
      hero_location,
      hero_year,
      gallery_images,
      blocks,
      hero_image_url,
      og_image_url,
    } = body;

    const validationErrors = validatePostInput(body, true);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Parse JSON fields
    let parsedHeroTags: string[] = [];
    let parsedBlocks: ProcessedBlock[] = [];
    let existingGallery: string[] = [];

    try {
      parsedHeroTags = parseJsonField<string[]>(hero_tags, 'hero_tags') || [];
      parsedBlocks = processBlocks(blocks);
      existingGallery = parseJsonField<string[]>(gallery_images, 'gallery_images') || [];
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message });
    }

    // Process uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const processedFiles = await processUploadedFiles(files, existingGallery, {
      hero_image_url,
      og_image_url,
    });

    // Create post
    const post = await postService.create({
      title,
      slug: slug || postService.generateSlug(title),
      status,
      seo_title,
      seo_description,
      hero_image_url: processedFiles.heroImageUrl,
      og_image_url: processedFiles.ogImageUrl,
      hero_title,
      hero_subtitle,
      hero_tags: parsedHeroTags,
      hero_location,
      hero_year,
      gallery_images: processedFiles.galleryUrls,
      blocks: parsedBlocks as unknown as {
        type: BlockType;
        data: BlockData;
        sort_order?: number;
      }[],
    });

    await activityLogService.log({
      user_email: 'api',
      action: 'create',
      entity_type: 'post',
      entity_id: post.id,
      entity_title: post.title,
    });

    res.status(201).json(post);
  })
);

/**
 * PUT /api/v1/posts/:id
 * Update an existing post (JSON or multipart/form-data)
 */
router.put(
  '/:id',
  uploadPostMedia,
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const body = req.body as PostBody;
    const {
      title,
      slug,
      status,
      seo_title,
      seo_description,
      hero_title,
      hero_subtitle,
      hero_tags,
      hero_location,
      hero_year,
      gallery_images,
      blocks,
      hero_image_url: heroImageUrlFromBody,
      og_image_url: ogImageUrlFromBody,
    } = body;

    const validationErrors = validatePostInput(body, false);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: validationErrors });
    }

    // Get existing post
    const existing = await postService.getById(id);

    // Parse JSON fields
    let parsedHeroTags: string[] | undefined;
    let parsedBlocks: ProcessedBlock[] | undefined;
    let existingGallery: string[];

    try {
      if (hero_tags !== undefined) {
        parsedHeroTags = parseJsonField<string[]>(hero_tags, 'hero_tags') || [];
      }
      if (blocks !== undefined) {
        parsedBlocks = processBlocks(blocks);
      }
      existingGallery =
        gallery_images !== undefined
          ? parseJsonField<string[]>(gallery_images, 'gallery_images') || []
          : existing.post.gallery_images || [];
    } catch (e) {
      return res.status(400).json({ error: (e as Error).message });
    }

    // Process uploaded files
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Hero image: file takes priority over URL
    let heroImageUrl = existing.post.hero_image_url;
    if (files?.['hero_image']?.[0]) {
      if (heroImageUrl) {
        await storageService.deleteImage(heroImageUrl);
      }
      heroImageUrl = await storageService.uploadImage(files['hero_image'][0], 'posts');
    } else if (heroImageUrlFromBody !== undefined) {
      heroImageUrl = heroImageUrlFromBody || undefined;
    }

    // OG image: file takes priority over URL
    let ogImageUrl = existing.post.og_image_url;
    if (files?.['og_image']?.[0]) {
      if (ogImageUrl) {
        await storageService.deleteImage(ogImageUrl);
      }
      ogImageUrl = await storageService.uploadImage(files['og_image'][0], 'posts');
    } else if (ogImageUrlFromBody !== undefined) {
      ogImageUrl = ogImageUrlFromBody || undefined;
    }

    const galleryFiles = files?.['gallery_images'] || [];
    const newGalleryUrls: string[] = [];
    for (const file of galleryFiles) {
      newGalleryUrls.push(await storageService.uploadImage(file, 'posts'));
    }

    const finalGalleryImages = [...existingGallery, ...newGalleryUrls];

    // Update post
    const post = await postService.update(id, {
      title,
      slug,
      status,
      seo_title,
      seo_description,
      hero_image_url: heroImageUrl,
      og_image_url: ogImageUrl,
      hero_title,
      hero_subtitle,
      hero_tags: parsedHeroTags,
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
      user_email: 'api',
      action: 'update',
      entity_type: 'post',
      entity_id: post.id,
      entity_title: post.title,
    });

    res.json(post);
  })
);

/**
 * DELETE /api/v1/posts/:id
 * Delete a post by ID
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const { post } = await postService.getById(id);

    await postService.delete(id);

    await activityLogService.log({
      user_email: 'api',
      action: 'delete',
      entity_type: 'post',
      entity_id: id,
      entity_title: post.title,
    });

    res.json({ message: 'Post deleted successfully' });
  })
);

export default router;
