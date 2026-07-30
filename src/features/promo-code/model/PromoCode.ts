import type { PromoCodeStatus } from './PromoCodeStatus';

export interface PromoCode {
  id: string;
  code: string;
  status: PromoCodeStatus;
  assignedTo: string | null;
  assignedAt: string | null;
  usedAt: string | null;
  expiresAt: string | null;
}

export type PromoCodeViewState =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'codes'; codes: PromoCode[] }
  | { type: 'empty' }
  | { type: 'error'; message: string };
