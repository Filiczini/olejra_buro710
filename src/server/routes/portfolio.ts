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

export default router;
