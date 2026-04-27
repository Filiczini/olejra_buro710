import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { loginSchema } from '@buro710/shared';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate.js';
import { generateToken } from '../config/jwt';
import { userService } from '../services/userService';
import { refreshTokenService } from '../services/refreshTokenService';
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

      const tokenVersion = await userService.getTokenVersion(user.id);
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion,
      });
      const refreshToken = await refreshTokenService.create(user.id);

      res.json({
        token,
        refreshToken,
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

router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Promise.all([
      userService.incrementTokenVersion(req.user!.userId),
      refreshTokenService.revokeAllForUser(req.user!.userId),
    ]);
  } catch {
    // best-effort: still clear client token even if DB update fails
  }
  res.json({ message: 'Logged out successfully' });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken, userId } = req.body;

  if (!refreshToken || !userId) {
    return res.status(400).json({ error: 'Missing refreshToken or userId' });
  }

  try {
    const isValid = await refreshTokenService.verify(userId, refreshToken);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await userService.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const tokenVersion = await userService.getTokenVersion(user.id);
    const newAccessToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion,
    });
    const newRefreshToken = await refreshTokenService.rotate(user.id, refreshToken);

    res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Refresh error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
