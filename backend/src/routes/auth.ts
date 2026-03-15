import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { loginSchema } from '@buro710/shared';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate.js';
import { generateToken } from '../config/jwt';
import { userService } from '../services/userService';
import { logger } from '../lib/logger.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Забагато спроб входу. Спробуйте пізніше.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password_hash);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      logger.error('Login error', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/logout', authMiddleware, (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    logger.error('Get user error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
