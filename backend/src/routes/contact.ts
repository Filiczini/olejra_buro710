import { Router } from 'express';
import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { contactService } from '../services/contactService';

const router = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Забагато запитів. Спробуйте пізніше.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', contactLimiter, async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Всі поля обов\'язкові' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Невірний формат email' });
  }

  if (message.length < 10) {
    return res.status(400).json({ error: 'Повідомлення занадто коротке' });
  }

  try {
    const result = await contactService.create({ name, email, subject, message });
    res.json(result);
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Помилка при відправці повідомлення' });
  }
});

export default router;
