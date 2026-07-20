import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, editorMiddleware } from '../middleware/auth';
import { activityLogService } from '../services/activityLogService';
import { asyncHandler } from '../middleware/asyncHandler';

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

router.get(
  '/',
  authMiddleware,
  editorMiddleware,
  asyncHandler(async (req, res) => {
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
  })
);

router.get(
  '/users',
  authMiddleware,
  editorMiddleware,
  asyncHandler(async (_req, res) => {
    const users = await activityLogService.getUniqueUsers();
    res.json(users);
  })
);

export default router;
