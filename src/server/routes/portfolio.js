import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { projectService } from '../services/projectService';
import { storageService } from '../services/storageService';
import { uploadProjectMedia } from '../middleware/multer';
import { supabase } from '../config/supabase';
const router = Router();
router.get('/', async (req, res) => {
    try {
        const { page, limit, tags, location, year, search, sortBy, sortOrder } = req.query;
        const result = await projectService.getAll({
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            sortBy: sortBy,
            sortOrder: sortOrder || 'desc',
            tags: tags ? tags.split(',') : undefined,
            location: location,
            year: year,
            search: search,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
router.get('/filters', async (_req, res) => {
    try {
        const filters = await projectService.getFiltersOptions();
        res.json(filters);
    }
    catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({ error: 'Failed to fetch filters' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const result = await projectService.getById(req.params.id);
        // Returns: { project: Project, heroMedia: Media[], galleryMedia: Media[] }
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(404).json({ error: 'Project not found' });
    }
});
router.post('/', authMiddleware, uploadProjectMedia, async (req, res) => {
    try {
        console.log('=== POST /portfolio ===');
        console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
        console.log('Body:', req.body);
        const files = req.files;
        const heroFiles = files?.['heroMedia'] || [];
        const galleryFiles = files?.['galleryMedia'] || [];
        console.log('Hero files:', heroFiles.map(f => f.originalname));
        console.log('Gallery files:', galleryFiles.map(f => f.originalname));
        const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote } = req.body;
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
        }
        else if (galleryFiles.length > 0) {
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
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
router.put('/:id', authMiddleware, uploadProjectMedia, async (req, res) => {
    try {
        console.log('=== PUT /portfolio/:id ===');
        console.log('Body:', req.body);
        const { title, description, tags, location, area, year, team, architects, concept_heading, concept_caption, concept_quote, heroMediaIdsOrdered, galleryMediaIdsOrdered } = req.body;
        const existing = await projectService.getById(req.params.id);
        const files = req.files;
        const heroFiles = files?.['heroMedia'] || [];
        const galleryFiles = files?.['galleryMedia'] || [];
        console.log('New hero files:', heroFiles.map(f => f.originalname));
        console.log('New gallery files:', galleryFiles.map(f => f.originalname));
        console.log('Hero media IDs ordered:', heroMediaIdsOrdered);
        console.log('Gallery media IDs ordered:', galleryMediaIdsOrdered);
        // Parse ordered IDs arrays, ensuring they are string arrays
        const heroIds = heroMediaIdsOrdered
            ? Array.isArray(heroMediaIdsOrdered)
                ? heroMediaIdsOrdered
                : JSON.parse(heroMediaIdsOrdered)
            : [];
        const galleryIds = galleryMediaIdsOrdered
            ? Array.isArray(galleryMediaIdsOrdered)
                ? galleryMediaIdsOrdered
                : JSON.parse(galleryMediaIdsOrdered)
            : [];
        // Handle hero media
        await handleMediaUpdate(req.params.id, existing.heroMedia, heroIds, heroFiles, 'hero');
        // Handle gallery media
        await handleMediaUpdate(req.params.id, existing.galleryMedia, galleryIds, galleryFiles, 'gallery');
        // Update image_url if new hero files were uploaded (use first hero file)
        let imageUrl = existing.project.image_url;
        if (heroFiles.length > 0) {
            // Delete old hero image if it's different from existing
            if (existing.heroMedia.length > 0) {
                await storageService.deleteImage(existing.heroMedia[0].url);
            }
            imageUrl = await storageService.uploadImage(heroFiles[0]);
        }
        // Update project fields
        const project = await projectService.update(req.params.id, {
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
            heroMediaIdsOrdered: heroIds,
            galleryMediaIdsOrdered: galleryIds,
        });
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const result = await projectService.getById(req.params.id);
        // Delete all media files from storage
        const allMediaUrls = [...result.heroMedia, ...result.galleryMedia].map(m => m.url);
        if (allMediaUrls.length > 0) {
            await storageService.deleteImages(allMediaUrls);
        }
        // Delete project (media records will cascade delete via foreign key)
        await projectService.delete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
/**
 * Handle media updates for a project: upload new files, delete removed media, and reorder.
 * @param projectId - UUID of the project
 * @param existingMedia - Current media for this role
 * @param orderedIds - Ordered list of media IDs to keep
 * @param newFiles - New files to upload
 * @param role - Media role ('hero' or 'gallery')
 */
async function handleMediaUpdate(projectId, existingMedia, orderedIds, newFiles, role) {
    // Delete media not in the ordered list
    const idsToKeep = new Set(orderedIds);
    const mediaToDelete = existingMedia.filter(m => !idsToKeep.has(m.id));
    if (mediaToDelete.length > 0) {
        // Delete files from storage
        await storageService.deleteImages(mediaToDelete.map(m => m.url));
        // Delete media records from database
        const idsToDelete = mediaToDelete.map(m => m.id);
        await supabase
            .from('media')
            .delete()
            .in('id', idsToDelete);
    }
    // Upload new files and create media records
    if (newFiles.length > 0) {
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
        if (error)
            throw error;
    }
}
export default router;
