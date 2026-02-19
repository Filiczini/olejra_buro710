import { z } from 'zod';

export const portfolioCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  subtitle: z.string().max(300, 'Subtitle must be at most 300 characters').optional(),
  location: z.string().max(200, 'Location must be at most 200 characters').optional(),
  area: z.string().max(50, 'Area must be at most 50 characters').optional(),
  year: z.string().max(20, 'Year must be at most 20 characters').optional(),
  tags: z.array(z.string()).max(15, 'Maximum 15 tags allowed').optional(),
});

export const portfolioUpdateSchema = portfolioCreateSchema.partial();

export type PortfolioCreateInput = z.infer<typeof portfolioCreateSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
