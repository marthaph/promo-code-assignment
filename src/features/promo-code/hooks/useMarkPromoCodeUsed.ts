import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PromoCode } from '../model/PromoCode';
import type { PromoCodeRepository } from '../api/PromoCodeRepository';
import { ASSIGNED_PROMO_CODE_KEY } from './useAssignedPromoCode';

export function useMarkPromoCodeUsed(repository: PromoCodeRepository, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (codeId: string) => repository.markUsed(codeId),
    onSuccess: (updatedCode) => {
      queryClient.setQueryData<PromoCode[]>(
        [ASSIGNED_PROMO_CODE_KEY, userId],
        (prev) => prev?.map((c) => (c.id === updatedCode.id ? updatedCode : c)) ?? [],
      );
    },
  });
}
