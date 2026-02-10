import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { activityLogService } from '../services/activityLogService';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page, limit, user_email, action } = req.query;

    const result = await activityLogService.getLogs({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      user_email: user_email as string,
      action: action as 'create' | 'update' | 'delete',
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

router.get('/users', authMiddleware, async (_req, res) => {
  try {
    const users = await activityLogService.getUniqueUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching unique users:', error);
    res.status(500).json({ error: 'Failed to fetch unique users' });
  }
});

export default router;
