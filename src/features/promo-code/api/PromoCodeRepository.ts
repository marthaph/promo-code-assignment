import type { PromoCode } from '../model/PromoCode';

export interface PromoCodeRepository {
  getAssigned(userId: string): Promise<PromoCode[]>;
  markUsed(codeId: string): Promise<PromoCode>;
  resetAll(): Promise<void>;
}
