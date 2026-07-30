import { useQuery } from '@tanstack/react-query';
import type { PromoCodeRepository } from '../api/PromoCodeRepository';

export const ASSIGNED_PROMO_CODE_KEY = 'assignedPromoCode';

export function useAssignedPromoCode(
  repository: PromoCodeRepository,
  userId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [ASSIGNED_PROMO_CODE_KEY, userId],
    queryFn: () => repository.getAssigned(userId),
    staleTime: 1000 * 60,
    retry: 1,
    enabled,
  });
}
