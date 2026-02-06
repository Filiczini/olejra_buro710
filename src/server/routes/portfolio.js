import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
const router = Router();
router.post('/', authMiddleware, uploadMiddleware.single('image'), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Image is required' });
        }
        const parsedTags = tags ? JSON.parse(tags) : [];
        const project = {
            id: Date.now().toString(),
            title,
            description,
            imageUrl: `/uploads/${req.file.filename}`,
            tags: parsedTags,
            createdAt: new Date().toISOString(),
        };
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
export default router;
