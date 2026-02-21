import { Router } from 'express';
import type { Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import type { AuthenticatedRequest } from '../types/express.js';
import { projectService } from '../services/projectService';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadProjectMedia } from '../middleware/multer';
import { portfolioCreateSchema, portfolioUpdateSchema } from '../schemas/index.js';
import { validateFormData } from '../middleware/validate.js';
import { logger } from '../lib/logger.js';
import type { PortfolioItem } from '../types/portfolio';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page, limit, tags, location, year, search, sortBy, sortOrder } = req.query;

    const result = await projectService.getAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
      tags: tags ? (tags as string).split(',') : undefined,
      location: location as string,
      year: year as string,
      search: search as string,
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching projects', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const { page = '1', limit = '12', tags, search } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const [projectsResult, postsResult] = await Promise.all([
      projectService.getAll({ limit: 1000 }),
      postService.getAll({ status: 'published', limit: 1000 }),
    ]);

    let allItems: PortfolioItem[] = [
      ...projectsResult.data.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        subtitle: p.subtitle,
        image_url: p.image_url,
        tags: p.tags || [],
        location: p.location,
        year: p.year,
        created_at: p.created_at,
      })),
      ...postsResult.data.map((p) => ({
        id: p.id,
        type: 'post' as const,
        title: p.hero_title || p.title,
        subtitle: p.hero_subtitle,
        image_url: p.hero_image_url || '',
        tags: p.hero_tags || [],
        location: p.hero_location,
        year: p.hero_year,
        slug: p.slug,
        created_at: p.created_at,
      })),
    ];

    if (tags) {
      const tagFilters = (tags as string).split(',').map((t) => t.toLowerCase().trim());
      allItems = allItems.filter((item) =>
        item.tags.some((tag) => tagFilters.includes(tag.toLowerCase()))
      );
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      allItems = allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(searchLower))
      );
    }

    allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = allItems.length;
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedItems = allItems.slice(offset, offset + limitNum);

    const allTags = new Set<string>();
    allItems.forEach((item) => item.tags.forEach((tag) => allTags.add(tag)));

    res.json({
      data: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      filters: {
        tags: Array.from(allTags).sort(),
      },
    });
  } catch (error) {
    logger.error('Error fetching all portfolio items', error);
    res.status(500).json({ error: 'Failed to fetch portfolio items' });
  }
});

router.get('/filters', async (_req, res) => {
  try {
    const filters = await projectService.getFiltersOptions();
    res.json(filters);
  } catch (error) {
    logger.error('Error fetching filters', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await projectService.getById(id);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching project', error);
    res.status(404).json({ error: 'Project not found' });
  }
});

router.post(
  '/',
  authMiddleware,
  uploadProjectMedia,
  validateFormData(portfolioCreateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const heroFiles = files?.['heroMedia'] || [];

      const { title, subtitle, tags, location, area, year } = req.body;

      let imageUrl = '';
      if (heroFiles.length > 0) {
        imageUrl = await storageService.uploadImage(heroFiles[0]);
      }

      const project = await projectService.create({
        title,
        subtitle,
        image_url: imageUrl,
        tags: tags || [],
        location,
        area,
        year,
        heroFiles,
      });

      await activityLogService.log({
        user_email: req.user?.email || 'unknown',
        action: 'create',
        entity_type: 'project',
        entity_id: project.id,
        entity_title: project.title,
        changes: { media_added: heroFiles.length },
      });

      res.status(201).json(project);
    } catch (error) {
      logger.error('Error creating project', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  uploadProjectMedia,
  validateFormData(portfolioUpdateSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      const { title, subtitle, tags, location, area, year } = req.body;

      const existing = await projectService.getById(id);
      const existingProject = existing.project;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const heroFiles = files?.['heroMedia'] || [];

      let imageUrl = existingProject.image_url;
      if (heroFiles.length > 0) {
        if (existing.heroMedia.length > 0) {
          await storageService.deleteImage(existing.heroMedia[0].url);
        }
        imageUrl = await storageService.uploadImage(heroFiles[0]);
      }

      const changes: Record<string, unknown> = {};
      const changedFields: string[] = [];
      const fieldsToCompare = ['title', 'subtitle', 'tags', 'location', 'area', 'year'] as const;

      const newData: Record<string, unknown> = {
        title: title ?? existingProject.title,
        subtitle: subtitle ?? existingProject.subtitle,
        image_url: imageUrl,
        tags: tags !== undefined ? tags : existingProject.tags,
        location: location ?? existingProject.location,
        area: area ?? existingProject.area,
        year: year ?? existingProject.year,
      };

      for (const field of fieldsToCompare) {
        const existingValue = existingProject[field];
        const newValue = newData[field];
        if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
          changedFields.push(field);
        }
      }

      if (changedFields.length > 0) {
        changes.fields = changedFields;
      }

      if (heroFiles.length > 0) {
        changes.media_added = heroFiles.length;
      }

      const project = await projectService.update(id, {
        title: newData.title as string,
        subtitle: newData.subtitle as string | undefined,
        image_url: imageUrl,
        tags: newData.tags as string[],
        location: newData.location as string | undefined,
        area: newData.area as string | undefined,
        year: newData.year as string | undefined,
        heroFile: heroFiles.length > 0 ? heroFiles[0] : undefined,
      });

      await activityLogService.log({
        user_email: req.user?.email || 'unknown',
        action: 'update',
        entity_type: 'project',
        entity_id: id,
        entity_title: project.title,
        changes: Object.keys(changes).length > 0 ? changes : undefined,
      });

      res.json(project);
    } catch (error) {
      logger.error('Error updating project', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }
);

router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await projectService.getById(id);

    await activityLogService.log({
      user_email: req.user?.email || 'unknown',
      action: 'delete',
      entity_type: 'project',
      entity_id: id,
      entity_title: result.project.title,
      changes: {},
    });

    const allMediaUrls = result.heroMedia.map((m) => m.url);
    if (allMediaUrls.length > 0) {
      await storageService.deleteImages(allMediaUrls);
    }

    await projectService.delete(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
