import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { contactService } from '../services/contactService';
import { contactSchema } from '@buro710/shared';
import { validateBody } from '../middleware/validate.js';
import { logger } from '../lib/logger.js';

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
  async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    try {
      const result = await contactService.create({ name, email, subject, message });
      res.json(result);
    } catch (error) {
      logger.error('Contact form error', error);
      res.status(500).json({ error: 'Помилка при відправці повідомлення' });
    }
  }
);

export default router;
