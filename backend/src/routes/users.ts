import { Router } from 'express';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userCreateSchema } from '@buro710/shared';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate.js';
import { userService } from '../services/userService';
import { refreshTokenService } from '../services/refreshTokenService';
import { asyncHandler, getParam } from '../middleware/asyncHandler';

const router = Router();

router.get(
  '/users',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (_req: Request, res: Response) => {
    const list = await userService.findAll();
    res.json(list);
  })
);

router.post(
  '/users',
  authMiddleware,
  adminMiddleware,
  validateBody(userCreateSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    const existing = await userService.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Користувач з таким email вже існує' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userService.create(email, passwordHash, role);
    res.status(201).json(user);
  })
);

router.delete(
  '/users/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const id = getParam(req.params.id);

    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'Не можна видалити власний акаунт' });
    }

    const user = await userService.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }

    await Promise.all([refreshTokenService.revokeAllForUser(id), userService.delete(id)]);

    res.json({ message: 'Користувача видалено' });
  })
);

router.patch(
  '/users/:id/password',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const id = getParam(req.params.id);
    const { password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Пароль має бути не менше 6 символів' });
    }

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
  })
);

export default router;
