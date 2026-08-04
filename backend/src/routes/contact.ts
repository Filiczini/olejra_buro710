import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { contactService } from '../services/contactService';
import { contactSchema } from '@buro710/shared';
import { validateBody } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Забагато запитів. Спробуйте пізніше.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/',
  contactLimiter,
  validateBody(contactSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, message } = req.body;

    const result = await contactService.create({ name, email, phone, message });
    res.json(result);
  })
);

export default router;
