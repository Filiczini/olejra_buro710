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
import { asyncHandler } from '../middleware/asyncHandler';

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
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

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
  })
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    await Promise.all([
      userService.incrementTokenVersion(req.user!.userId).catch(() => {}),
      refreshTokenService.revokeAllForUser(req.user!.userId).catch(() => {}),
    ]);
    res.json({ message: 'Logged out successfully' });
  })
);

router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken, userId } = req.body;

    if (!refreshToken || !userId) {
      return res.status(400).json({ error: 'Missing refreshToken or userId' });
    }

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
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

export default router;
