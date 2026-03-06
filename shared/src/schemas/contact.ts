import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, "Ім'я обов'язкове").max(100, "Ім'я не може бути довшим за 100 символів"),
  email: z
    .string()
    .min(1, "Email обов'язковий")
    .email('Невірний формат email')
    .max(200, 'Email не може бути довшим за 200 символів'),
  subject: z
    .string()
    .min(1, "Тема обов'язкова")
    .max(200, 'Тема не може бути довшою за 200 символів'),
  message: z
    .string()
    .min(1, "Повідомлення обов'язкове")
    .max(5000, 'Повідомлення не може бути довшим за 5000 символів'),
});

export type ContactInput = z.infer<typeof contactSchema>;
