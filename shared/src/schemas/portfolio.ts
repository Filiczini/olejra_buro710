import { z } from 'zod';

export const portfolioCreateSchema = z.object({
  title: z.string().min(1, "Назва обов'язкова").max(200, 'Назва не може бути довшою за 200 символів'),
  subtitle: z.string().max(300, 'Subtitle не може бути довшим за 300 символів').optional(),
  location: z.string().max(200, 'Location не може бути довшим за 200 символів').optional(),
  area: z.string().max(50, 'Area не може бути довшим за 50 символів').optional(),
  year: z.string().max(20, 'Year не може бути довшим за 20 символів').optional(),
  tags: z
    .array(z.string().max(20, 'Тег не може бути довшим за 20 символів'))
    .max(15, 'Максимум 15 тегів')
    .optional(),
});

export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
