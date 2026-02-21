import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address').max(200, 'Email must be at most 200 characters'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be at most 200 characters'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message must be at most 5000 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;
