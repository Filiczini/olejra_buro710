import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { activityLogService } from '../services/activityLogService';
import { logger } from '../lib/logger';

const router = Router();

const logsRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.use(logsRateLimiter);

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page, limit, user_email, action } = req.query;

    const parsedPage = page ? Math.max(1, parseInt(page as string, 10) || 1) : undefined;
    const parsedLimit = limit
      ? Math.min(100, Math.max(1, parseInt(limit as string, 10) || 10))
      : undefined;

    const result = await activityLogService.getLogs({
      page: parsedPage,
      limit: parsedLimit,
      user_email: user_email as string,
      action: action as 'create' | 'update' | 'delete',
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

router.get('/users', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const users = await activityLogService.getUniqueUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching unique users:', error);
    res.status(500).json({ error: 'Failed to fetch unique users' });
  }
});

export default router;
