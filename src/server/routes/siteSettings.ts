import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { siteSettingsService } from '../services/siteSettingsService';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const settings = await siteSettingsService.getAll();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    if (typeof key !== 'string') {
      return res.status(400).json({ error: 'Invalid key' });
    }

    const setting = await siteSettingsService.update(key, value);
    res.json(setting);
  } catch (error) {
    console.error('Error updating site setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
