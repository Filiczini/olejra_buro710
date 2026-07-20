import { Router } from 'express';
import { authMiddleware, editorMiddleware } from '../middleware/auth';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadGalleryImages } from '../middleware/multer';
import { asyncHandler, getParam } from '../middleware/asyncHandler';

const router = Router();

router.post(
  '/:id/gallery',
  authMiddleware,
  editorMiddleware,
  uploadGalleryImages,
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
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
  })
);

router.delete(
  '/:id/gallery',
  authMiddleware,
  editorMiddleware,
  asyncHandler(async (req, res) => {
    const id = getParam(req.params.id);
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
  })
);

export default router;
