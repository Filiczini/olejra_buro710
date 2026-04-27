import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userCreateSchema } from '@buro710/shared';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate.js';
import { userService } from '../services/userService';
import { refreshTokenService } from '../services/refreshTokenService';
import { logger } from '../lib/logger.js';

const router = Router();

router.get('/users', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  try {
    const list = await userService.findAll();
    res.json(list);
  } catch (error) {
    logger.error('Error fetching users', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post(
  '/users',
  authMiddleware,
  adminMiddleware,
  validateBody(userCreateSchema),
  async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    try {
      const existing = await userService.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Користувач з таким email вже існує' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await userService.create(email, passwordHash, role);
      res.status(201).json(user);
    } catch (error) {
      logger.error('Error creating user', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.delete(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'Не можна видалити власний акаунт' });
    }

    try {
      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }

      await Promise.all([refreshTokenService.revokeAllForUser(id), userService.delete(id)]);

      res.json({ message: 'Користувача видалено' });
    } catch (error) {
      logger.error('Error deleting user', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.patch(
  '/users/:id/password',
  authMiddleware,
  adminMiddleware,
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

    try {
      const user = await userService.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await Promise.all([
        userService.updatePassword(id, passwordHash),
        refreshTokenService.revokeAllForUser(id),
      ]);

      res.json({ message: 'Пароль оновлено' });
    } catch (error) {
      logger.error('Error updating password', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
