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
import { setAuthCookies, clearAuthCookies, REFRESH_TOKEN_COOKIE } from '../lib/authCookies';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Забагато спроб входу. Спробуйте пізніше.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many refresh attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
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

    setAuthCookies(res, token, refreshToken);
    res.json({
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
    clearAuthCookies(res);
    res.json({ message: 'Logged out successfully' });
  })
);

router.post(
  '/refresh',
  refreshLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Cookie-based flow (current frontend); body-based flow kept for
    // API clients that still send { refreshToken, userId }.
    const cookieToken: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE];
    const bodyToken: string | undefined = req.body?.refreshToken;
    const bodyUserId: string | undefined = req.body?.userId;

    let refreshToken: string;
    let userId: string;

    if (cookieToken) {
      const foundUserId = await refreshTokenService.findUserByToken(cookieToken);
      if (!foundUserId) {
        clearAuthCookies(res);
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      refreshToken = cookieToken;
      userId = foundUserId;
    } else {
      if (!bodyToken || !bodyUserId) {
        return res.status(400).json({ error: 'Missing refreshToken or userId' });
      }
      const isValid = await refreshTokenService.verify(bodyUserId, bodyToken);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      refreshToken = bodyToken;
      userId = bodyUserId;
    }

    const user = await userService.findById(userId);
    if (!user) {
      clearAuthCookies(res);
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

    setAuthCookies(res, newAccessToken, newRefreshToken);
    res.json({
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
