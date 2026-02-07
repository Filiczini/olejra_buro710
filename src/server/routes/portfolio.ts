import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { projectService } from '../services/projectService';
import { storageService } from '../services/storageService';
import { uploadSingleImage } from '../middleware/multer';

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
    const project = await projectService.getById(req.params.id);
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(404).json({ error: 'Project not found' });
  }
});

router.get('/:id/next', async (req, res) => {
  try {
    const nextProject = await projectService.getNextProject(req.params.id as string);
    res.json(nextProject);
  } catch (error) {
    console.error('Error fetching next project:', error);
    res.status(500).json({ error: 'Failed to fetch next project' });
  }
});

router.post('/', authMiddleware, uploadSingleImage, async (req, res) => {
  try {
    console.log('=== POST /portfolio ===');
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
    console.log('Body:', { ...req.body, image: '[FILE]' });
    console.log('File:', req.file ? { name: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : 'No file');

    const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote } = req.body as any;

    if (!title || !description) {
      console.log('❌ Validation failed: Title or description missing');
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!req.file) {
      console.log('❌ Validation failed: Image missing');
      return res.status(400).json({ error: 'Image is required' });
    }

    console.log('✅ Validation passed, uploading image...');
    const imageUrl = await storageService.uploadImage(req.file);

    console.log('✅ Image uploaded:', imageUrl);
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
    });

    console.log('✅ Project created successfully:', project.id);
    res.status(201).json(project);
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.put('/:id', authMiddleware, uploadSingleImage, async (req, res) => {
  try {
    const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote } = req.body as any;

    const existing = await projectService.getById(req.params.id as string);

    let imageUrl = existing.image_url;

    if (req.file) {
      await storageService.deleteImage(existing.image_url);
      imageUrl = await storageService.uploadImage(req.file);
    }

    const project = await projectService.update(req.params.id as string, {
      title,
      description: description ? [description] : existing.description,
      image_url: imageUrl,
      tags: tags ? JSON.parse(tags) : existing.tags,
      location,
      area,
      year,
      team,
      architects,
      concept_heading,
      concept_caption,
      concept_quote,
    });

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await projectService.getById(req.params.id as string);

    await storageService.deleteImage(project.image_url);

    await projectService.delete(req.params.id as string);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// GET sections for a project
router.get('/:projectId/sections', async (req, res) => {
  try {
    const projectId = req.params.projectId as string;

    const { data, error } = await projectService.getById(projectId);

    if (error) {
      console.error('Error fetching project sections:', error);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    return res.json({ sections: data.sections || [] });
  } catch (error) {
    console.error('Error fetching project sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// PUT update sections (admin only)
router.put('/:projectId/sections', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const { sections } = req.body as { sections: any[] };

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Sections must be an array' });
    }

    console.log(`=== PUT /portfolio/${projectId}/sections ===`);
    console.log('Sections count:', sections.length);

    const project = await projectService.update(projectId, { sections });

    console.log('✅ Sections updated successfully');
    res.json({ project });
  } catch (error) {
    console.error('Error updating sections:', error);
    res.status(500).json({ error: 'Failed to update sections' });
  }
});

// PUT update section translations (admin only)
router.put('/:projectId/translations', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId as string;
    const { translations } = req.body as { translations: Record<string, any> };

    if (!translations || typeof translations !== 'object') {
      return res.status(400).json({ error: 'Invalid translations format' });
    }

    console.log(`=== PUT /portfolio/${projectId}/translations ===`);
    console.log('Translations:', Object.keys(translations));

    // Get existing project to merge translations
    const existing = await projectService.getById(projectId);
    const existingTranslations = (existing as any).translations || {};

    // Merge translations
    const updatedTranslations = {
      ...existingTranslations,
      ...translations
    };

    const project = await projectService.update(projectId, {
      translations: updatedTranslations
    } as any);

    console.log('✅ Translations updated successfully');
    res.json({ project });
  } catch (error) {
    console.error('Error updating translations:', error);
    res.status(500).json({ error: 'Failed to update translations' });
  }
});

export default router;
