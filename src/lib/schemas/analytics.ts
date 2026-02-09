import { z } from 'zod';

export const SatisfactionRatingSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type SatisfactionRatingInput = z.infer<typeof SatisfactionRatingSchema>;
