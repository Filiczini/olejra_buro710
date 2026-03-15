import { z } from 'zod';
export const loginSchema = z.object({
    email: z.string().email('Невірний формат email'),
    password: z.string().min(1, 'Пароль обов\'язковий'),
});
