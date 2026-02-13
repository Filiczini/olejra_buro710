import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { projectService } from '../services/projectService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadProjectMedia } from '../middleware/multer';

const router = Router();

const VALIDATION_LIMITS = {
  title: { minLength: 1, maxLength: 200 },
  subtitle: { maxLength: 300 },
  location: { maxLength: 200 },
  area: { maxLength: 50 },
  year: { maxLength: 20 },
  tags: { maxItems: 15 },
};

interface ValidationError {
  field: string;
  message: string;
}

const validateProjectInput = (data: {
  title?: string;
  subtitle?: string;
  location?: string;
  area?: string;
  year?: string;
  tags?: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];
  const { title, subtitle, location, area, year, tags } = data;

  if (title !== undefined) {
    if (title.length < VALIDATION_LIMITS.title.minLength) {
      errors.push({ field: 'title', message: 'Title is required' });
    } else if (title.length > VALIDATION_LIMITS.title.maxLength) {
      errors.push({ field: 'title', message: `Title must be at most ${VALIDATION_LIMITS.title.maxLength} characters` });
    }
  }

  if (subtitle && subtitle.length > VALIDATION_LIMITS.subtitle.maxLength) {
    errors.push({ field: 'subtitle', message: `Subtitle must be at most ${VALIDATION_LIMITS.subtitle.maxLength} characters` });
  }

  if (location && location.length > VALIDATION_LIMITS.location.maxLength) {
    errors.push({ field: 'location', message: `Location must be at most ${VALIDATION_LIMITS.location.maxLength} characters` });
  }

  if (area && area.length > VALIDATION_LIMITS.area.maxLength) {
    errors.push({ field: 'area', message: `Area must be at most ${VALIDATION_LIMITS.area.maxLength} characters` });
  }

  if (year && year.length > VALIDATION_LIMITS.year.maxLength) {
    errors.push({ field: 'year', message: `Year must be at most ${VALIDATION_LIMITS.year.maxLength} characters` });
  }

  if (tags) {
    try {
      const parsedTags = JSON.parse(tags);
      if (!Array.isArray(parsedTags)) {
        errors.push({ field: 'tags', message: 'Tags must be an array' });
      } else if (parsedTags.length > VALIDATION_LIMITS.tags.maxItems) {
        errors.push({ field: 'tags', message: `Maximum ${VALIDATION_LIMITS.tags.maxItems} tags allowed` });
      } else {
        for (const tag of parsedTags) {
          if (typeof tag !== 'string') {
            errors.push({ field: 'tags', message: 'Each tag must be a string' });
            break;
          }
        }
      }
    } catch {
      errors.push({ field: 'tags', message: 'Invalid tags format' });
    }
  }

  return errors;
};

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
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/filters', async (_req, res) => {
  try {
    const filters = await projectService.getFiltersOptions();
    res.json(filters);
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await projectService.getById(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(404).json({ error: 'Project not found' });
  }
});

router.post('/', authMiddleware, uploadProjectMedia, async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const heroFiles = files?.['heroMedia'] || [];

    const { title, subtitle, tags, location, area, year } = req.body as {
      title?: string;
      subtitle?: string;
      tags?: string;
      location?: string;
      area?: string;
      year?: string;
    };

    const validationErrors = validateProjectInput({ title, subtitle, location, area, year, tags });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let imageUrl = '';
    if (heroFiles.length > 0) {
      imageUrl = await storageService.uploadImage(heroFiles[0]);
    }

    const project = await projectService.create({
      title,
      subtitle,
      image_url: imageUrl,
      tags: tags ? JSON.parse(tags) : [],
      location,
      area,
      year,
      heroFiles,
    });

    await activityLogService.log({
      user_email: (req as any).user?.email || 'unknown',
      action: 'create',
      entity_type: 'project',
      entity_id: project.id,
      entity_title: project.title,
      changes: { media_added: heroFiles.length },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, uploadProjectMedia, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { title, subtitle, tags, location, area, year } = req.body as {
      title?: string;
      subtitle?: string;
      tags?: string;
      location?: string;
      area?: string;
      year?: string;
    };

    const validationErrors = validateProjectInput({ title, subtitle, location, area, year, tags });
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

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
      tags: tags !== undefined ? JSON.parse(tags) : existingProject.tags,
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
      user_email: (req as any).user?.email || 'unknown',
      action: 'update',
      entity_type: 'project',
      entity_id: id,
      entity_title: project.title,
      changes: Object.keys(changes).length > 0 ? changes : undefined,
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const result = await projectService.getById(id);

    await activityLogService.log({
      user_email: (req as any).user?.email || 'unknown',
      action: 'delete',
      entity_type: 'project',
      entity_id: id,
      entity_title: result.project.title,
      changes: {},
    });

    const allMediaUrls = result.heroMedia.map(m => m.url);
    if (allMediaUrls.length > 0) {
      await storageService.deleteImages(allMediaUrls);
    }

    await projectService.delete(id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
