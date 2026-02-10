import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { projectService } from '../services/projectService';
import { storageService } from '../services/storageService';
import { activityLogService } from '../services/activityLogService';
import { uploadProjectMedia } from '../middleware/multer';
import type { Media } from '../../types/project';
import { supabase } from '../config/supabase';

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
    const result = await projectService.getById(req.params.id);
    // Returns: { project: Project, heroMedia: Media[], galleryMedia: Media[] }
    res.json(result);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(404).json({ error: 'Project not found' });
  }
});

router.post('/', authMiddleware, uploadProjectMedia, async (req, res) => {
  try {
    console.log('=== POST /portfolio ===');
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
    console.log('Body:', req.body);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const heroFiles = files?.['heroMedia'] || [];
    const galleryFiles = files?.['galleryMedia'] || [];

    console.log('Hero files:', heroFiles.map(f => f.originalname));
    console.log('Gallery files:', galleryFiles.map(f => f.originalname));

    const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote } = req.body as any;

    if (!title || !description) {
      console.log('Validation failed: Title or description missing');
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (heroFiles.length === 0 && galleryFiles.length === 0) {
      console.log('Validation failed: No media files provided');
      return res.status(400).json({ error: 'At least one media file (hero or gallery) is required' });
    }

    // Upload files and build heroMedia and galleryMedia arrays
    const heroMedia = heroFiles; // Already Express.Multer.File[] format
    const galleryMedia = galleryFiles; // Already Express.Multer.File[] format

    // Use the first hero image as the main image_url for backward compatibility
    let imageUrl = '';
    if (heroFiles.length > 0) {
      imageUrl = await storageService.uploadImage(heroFiles[0]);
    } else if (galleryFiles.length > 0) {
      imageUrl = await storageService.uploadImage(galleryFiles[0]);
    }

    console.log('Creating project in database...');

    const project = await projectService.create({
      title,
      description: [description],
      image_url: imageUrl,
      tags: tags ? JSON.parse(tags) : [],
      location,
      area,
      year,
      team,
      architects,
      concept_heading,
      concept_caption,
      concept_quote,
      heroMedia,
      galleryMedia,
    });

    console.log('Project created successfully:', project.id);

    // Log activity
    await activityLogService.log({
      user_email: (req as any).user?.email || 'unknown',
      action: 'create',
      entity_type: 'project',
      entity_id: project.id,
      entity_title: project.title,
      changes: {
        media_added: heroFiles.length + galleryFiles.length,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, uploadProjectMedia, async (req, res) => {
  try {
    console.log('=== PUT /portfolio/:id ===');
    console.log('Body:', req.body);

    const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote, heroMediaIdsOrdered, galleryMediaIdsOrdered } = req.body as any;

    const existing = await projectService.getById(req.params.id as string);
    const existingProject = existing.project;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const heroFiles = files?.['heroMedia'] || [];
    const galleryFiles = files?.['galleryMedia'] || [];

    console.log('New hero files:', heroFiles.map(f => f.originalname));
    console.log('New gallery files:', galleryFiles.map(f => f.originalname));
    console.log('Hero media IDs ordered:', heroMediaIdsOrdered);
    console.log('Gallery media IDs ordered:', galleryMediaIdsOrdered);

    // Parse ordered IDs arrays, ensuring they are string arrays
    const heroIds: string[] = heroMediaIdsOrdered
      ? Array.isArray(heroMediaIdsOrdered)
        ? heroMediaIdsOrdered
        : JSON.parse(heroMediaIdsOrdered)
      : [];
    const galleryIds: string[] = galleryMediaIdsOrdered
      ? Array.isArray(galleryMediaIdsOrdered)
        ? galleryMediaIdsOrdered
        : JSON.parse(galleryMediaIdsOrdered)
      : [];

    // Handle hero media
    const heroMediaChanges = await handleMediaUpdate(
      req.params.id as string,
      existing.heroMedia,
      heroIds as string[],
      heroFiles,
      'hero'
    );

    // Handle gallery media
    const galleryMediaChanges = await handleMediaUpdate(
      req.params.id as string,
      existing.galleryMedia,
      galleryIds as string[],
      galleryFiles,
      'gallery'
    );

    // Update image_url if new hero files were uploaded (use first hero file)
    let imageUrl = existing.project.image_url;
    if (heroFiles.length > 0) {
      // Delete old hero image if it's different from existing
      if (existing.heroMedia.length > 0) {
        await storageService.deleteImage(existing.heroMedia[0].url);
      }
      imageUrl = await storageService.uploadImage(heroFiles[0]);
    }

    // Determine which fields changed
    const changes: any = {};
    const changedFields: string[] = [];

    const newProjectData: any = {
      title: title !== undefined ? title : existingProject.title,
      description: description ? [description] : existingProject.description,
      image_url: imageUrl,
      tags: tags !== undefined ? JSON.parse(tags) : existingProject.tags,
      location: location !== undefined ? location : existingProject.location,
      area: area !== undefined ? area : existingProject.area,
      year: year !== undefined ? year : existingProject.year,
      team: team !== undefined ? team : existingProject.team,
      architects: architects !== undefined ? architects : existingProject.architects,
      concept_heading: concept_heading !== undefined ? concept_heading : existingProject.concept_heading,
      concept_caption: concept_caption !== undefined ? concept_caption : existingProject.concept_caption,
      concept_quote: concept_quote !== undefined ? concept_quote : existingProject.concept_quote,
    };

    // Compare fields
    const fieldsToCompare = ['title', 'description', 'tags', 'location', 'area', 'year', 'team', 'architects', 'concept_heading', 'concept_caption', 'concept_quote'];
    for (const field of fieldsToCompare) {
      const existingValue = existingProject[field as keyof typeof existingProject];
      const newValue = newProjectData[field];

      // Special handling for arrays
      if (Array.isArray(existingValue) && Array.isArray(newValue)) {
        if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
          changedFields.push(field);
        }
      }
      // Special handling for null/undefined
      else if ((existingValue === undefined || existingValue === null) && newValue) {
        changedFields.push(field);
      }
      // Normal comparison
      else if (existingValue !== newValue) {
        changedFields.push(field);
      }
    }

    if (changedFields.length > 0) {
      changes.fields = changedFields;
    }

    // Track media changes
    if (heroMediaChanges.added > 0 || heroMediaChanges.removed > 0 || heroMediaChanges.reordered) {
      changes.media_added = (changes.media_added || 0) + heroMediaChanges.added;
      changes.media_removed = (changes.media_removed || 0) + heroMediaChanges.removed;
      changes.media_reordered = changes.media_reordered || heroMediaChanges.reordered;
    }

    if (galleryMediaChanges.added > 0 || galleryMediaChanges.removed > 0 || galleryMediaChanges.reordered) {
      changes.media_added = (changes.media_added || 0) + galleryMediaChanges.added;
      changes.media_removed = (changes.media_removed || 0) + galleryMediaChanges.removed;
      changes.media_reordered = changes.media_reordered || galleryMediaChanges.reordered;
    }

    // Update project fields
    const project = await projectService.update(req.params.id as string, {
      title,
      description: description ? [description] : existing.project.description,
      image_url: imageUrl,
      tags: tags ? JSON.parse(tags) : existing.project.tags,
      location,
      area,
      year,
      team,
      architects,
      concept_heading,
      concept_caption,
      concept_quote,
      heroMediaIdsOrdered: heroIds as string[],
      galleryMediaIdsOrdered: galleryIds as string[],
    });

    // Log activity
    await activityLogService.log({
      user_email: (req as any).user?.email || 'unknown',
      action: 'update',
      entity_type: 'project',
      entity_id: req.params.id as string,
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
    const result = await projectService.getById(req.params.id as string);

    // Log activity before deletion
    await activityLogService.log({
      user_email: (req as any).user?.email || 'unknown',
      action: 'delete',
      entity_type: 'project',
      entity_id: req.params.id as string,
      entity_title: result.project.title,
      changes: {},
    });

    // Delete all media files from storage
    const allMediaUrls = [...result.heroMedia, ...result.galleryMedia].map(m => m.url);
    if (allMediaUrls.length > 0) {
      await storageService.deleteImages(allMediaUrls);
    }

    // Delete project (media records will cascade delete via foreign key)
    await projectService.delete(req.params.id as string);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

interface MediaUpdateResult {
  added: number;
  removed: number;
  reordered: boolean;
}

/**
 * Handle media updates for a project: upload new files, delete removed media, and reorder.
 * @param projectId - UUID of the project
 * @param existingMedia - Current media for this role
 * @param orderedIds - Ordered list of media IDs to keep
 * @param newFiles - New files to upload
 * @param role - Media role ('hero' or 'gallery')
 * @returns Media update statistics
 */
async function handleMediaUpdate(
  projectId: string,
  existingMedia: Media[],
  orderedIds: string[],
  newFiles: Express.Multer.File[],
  role: 'hero' | 'gallery'
): Promise<MediaUpdateResult> {
  const result: MediaUpdateResult = {
    added: 0,
    removed: 0,
    reordered: false,
  };

  // Delete media not in the ordered list
  const idsToKeep = new Set(orderedIds);
  const mediaToDelete = existingMedia.filter(m => !idsToKeep.has(m.id));

  if (mediaToDelete.length > 0) {
    result.removed = mediaToDelete.length;
    // Delete files from storage
    await storageService.deleteImages(mediaToDelete.map(m => m.url));

    // Delete media records from database
    const idsToDelete = mediaToDelete.map(m => m.id);
    await supabase
      .from('media')
      .delete()
      .in('id', idsToDelete);
  }

  // Check if order changed
  const existingIds = existingMedia.map(m => m.id);
  const filteredExistingIds = existingIds.filter(id => idsToKeep.has(id));

  if (JSON.stringify(filteredExistingIds) !== JSON.stringify(orderedIds)) {
    result.reordered = true;
  }

  // Upload new files and create media records
  if (newFiles.length > 0) {
    result.added = newFiles.length;
    const uploadResult = await storageService.uploadImages(newFiles);

    if (uploadResult.errors.length > 0) {
      console.warn(`Some uploads failed: ${uploadResult.errors.join(', ')}`);
    }

    if (uploadResult.urls.length === 0) {
      throw new Error('No files were uploaded successfully');
    }

    const mediaRecords = uploadResult.urls.map((url, index) => ({
      project_id: projectId,
      url,
      role,
      sort_order: orderedIds.length + index, // Place after existing media
    }));

    const { error } = await supabase
      .from('media')
      .insert(mediaRecords);

    if (error) throw error;
  }

  return result;
}

export default router;
