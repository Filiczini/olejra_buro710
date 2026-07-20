import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  authMiddleware,
  adminMiddleware,
  editorMiddleware,
  optionalAuthMiddleware,
} from '../middleware/auth';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadBlockMedia } from '../middleware/multer';
import { blockService } from '../services/blockService';
import { postFileService } from '../services/postFileService';
import type { BlockData } from '@buro710/shared';
import { asyncHandler, getParam } from '../middleware/asyncHandler';
import {
  validatePostInput,
  parseBlocksJson,
  parseJsonField,
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

const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(adminRateLimiter);

router.get(
  '/',
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const { page, limit, status, search } = req.query;

    const parsedPage = page ? Math.max(1, parseInt(page as string, 10) || 1) : undefined;
    const parsedLimit = limit
      ? Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10))
      : undefined;

    // Unauthenticated users can only see published posts
    const effectiveStatus = req.user ? (status as 'draft' | 'published') : 'published';

    const result = await postService.getAll({
      page: parsedPage,
      limit: parsedLimit,
      status: effectiveStatus,
      search: search ? String(search).slice(0, 200) : undefined,
    });

    res.json(result);
  })
);

router.get(
  '/featured',
  publicRateLimiter,
  asyncHandler(async (_req, res) => {
    const posts = await postService.getFeatured();
    res.json(posts);
  })
);

router.get(
  '/public/:slug',
  publicRateLimiter,
  asyncHandler(async (req, res) => {
    const slug = getParam(req.params.slug);
    const result = await postService.getBySlug(slug);
    res.json(result);
  })
);

router.get(
  '/:id',
  authMiddleware,
  editorMiddleware,
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
    const result = await postService.getById(id);
    res.json(result);
  })
);

router.post(
  '/',
  authMiddleware,
  editorMiddleware,
  uploadBlockMedia,
  asyncHandler(async (req, res) => {
    const body: PostBody = req.body;
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

    const heroImageUrl = files?.['heroImage']?.[0]
      ? await storageService.uploadImage(files['heroImage'][0], 'blocks')
      : undefined;

    const ogImageUrl = files?.['ogImage']?.[0]
      ? await storageService.uploadImage(files['ogImage'][0], 'blocks')
      : undefined;

    const rawBlocks = parseBlocksJson(blocks);
    const blockImageFiles = files?.['blockImages'] || [];
    const { blocks: processedBlocks, uploads: blockUploads } = extractBlockImageUploads(
      rawBlocks,
      blockImageFiles
    );

    const existingGalleryUrls = postFileService.parseGalleryImages(gallery_images);
    const newGalleryUrls = await postFileService.uploadGalleryImages(
      files?.['galleryImages'] || [],
      'blocks'
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
      hero_tags: parseJsonField<string[]>(hero_tags, 'hero_tags') ?? [],
      hero_location,
      hero_year,
      gallery_images: finalGalleryImages,
      blocks: processedBlocks,
    });

    if (blockUploads.length > 0) {
      const uploadMap = await postFileService.processBlockImageUploads(blockUploads, 'blocks');
      const allBlocks = await blockService.getByPostId(post.id);
      const blocksByOrder = new Map(allBlocks.map((b) => [b.sort_order, b]));

      for (const [sortOrderStr, uploads] of Object.entries(uploadMap)) {
        const sortOrder = Number(sortOrderStr);
        const blockRecord = blocksByOrder.get(sortOrder);
        if (!blockRecord) continue;

        const currentData = { ...(blockRecord.data as Record<string, unknown>) };
        for (const upload of uploads) {
          if (upload.slot !== undefined) {
            const images = [...((currentData.images as { url: string; alt: string }[]) || [])];
            images[upload.slot] = { ...images[upload.slot], url: upload.url };
            currentData.images = images;
          } else {
            currentData.image_url = upload.url;
          }
        }
        await blockService.update(blockRecord.id, {
          data: currentData as BlockData,
        });
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
        blocks_count: rawBlocks.length,
        hero_updated: heroFields.length > 0,
        hero_fields: heroFields.length > 0 ? heroFields : undefined,
      },
    });

    res.status(201).json(post);
  })
);

router.put(
  '/:id',
  authMiddleware,
  editorMiddleware,
  uploadBlockMedia,
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
    const body: PostBody = req.body;
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

    const heroImageUrl = await postFileService.processImage({
      file: files?.['heroImage']?.[0],
      existingUrl: existing.post.hero_image_url,
      folder: 'blocks',
    });

    const ogImageUrl = await postFileService.processImage({
      file: files?.['ogImage']?.[0],
      existingUrl: existing.post.og_image_url,
      folder: 'blocks',
    });

    const rawBlocks = blocks ? parseBlocksJson(blocks) : undefined;
    const blockImageFiles = files?.['blockImages'] || [];

    const extracted = rawBlocks
      ? extractBlockImageUploads(rawBlocks, blockImageFiles)
      : { blocks: undefined, uploads: [] };
    let parsedBlocks = extracted.blocks;
    const blockUploadsForUpdate = extracted.uploads;

    const uploadMap = await postFileService.processBlockImageUploads(
      blockUploadsForUpdate,
      'blocks'
    );
    if (parsedBlocks) {
      parsedBlocks = postFileService.applyBlockImageUrls(parsedBlocks, uploadMap);
    }

    const existingGalleryUrls = gallery_images
      ? postFileService.parseGalleryImages(gallery_images)
      : existing.post.gallery_images || [];
    const newGalleryUrls = await postFileService.uploadGalleryImages(
      files?.['galleryImages'] || [],
      'blocks'
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
    const parsedHeroTags = parseJsonField<string[]>(hero_tags, 'hero_tags');
    const newHeroTags = parsedHeroTags ?? [];
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
      hero_tags: parsedHeroTags ?? undefined,
      hero_location,
      hero_year,
      gallery_images: finalGalleryImages,
      blocks: parsedBlocks,
    });

    // Remove files that this update stopped referencing (old gallery entries, images
    // of deleted/replaced blocks). Hero/og replacement is handled by processImage.
    const oldUrls = [
      ...(existing.post.gallery_images || []),
      ...postFileService.collectBlockImageUrls(existing.blocks),
    ];
    const stillReferenced = [
      ...finalGalleryImages,
      ...(parsedBlocks
        ? postFileService.collectBlockImageUrls(parsedBlocks as { data: Record<string, unknown> }[])
        : postFileService.collectBlockImageUrls(existing.blocks)),
      ...(heroImageUrl ? [heroImageUrl] : []),
      ...(ogImageUrl ? [ogImageUrl] : []),
    ];
    await postFileService.cleanupRemovedImages(oldUrls, stillReferenced);

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
  })
);

router.delete(
  '/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
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
  })
);

export default router;
