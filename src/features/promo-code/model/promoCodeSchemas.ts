import { z } from 'zod';

export const promoCodeStatusSchema = z.enum(['available', 'reserved', 'used', 'expired']);

export const promoCodeSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1),
  status: promoCodeStatusSchema,
  assignedTo: z.string().uuid().nullable(),
  assignedAt: z.string().datetime({ offset: true }).nullable(),
  usedAt: z.string().datetime({ offset: true }).nullable(),
  expiresAt: z.string().datetime({ offset: true }).nullable(),
});

export const assignPromoCodeResponseSchema = z.object({
  promoCode: promoCodeSchema,
});

export const markUsedResponseSchema = z.object({
  promoCode: promoCodeSchema,
});

export type PromoCodeSchema = z.infer<typeof promoCodeSchema>;
