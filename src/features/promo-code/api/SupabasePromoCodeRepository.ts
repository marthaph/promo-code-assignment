import type { PromoCode } from '../model/PromoCode';
import type { PromoCodeRepository } from './PromoCodeRepository';
import { promoCodeSchema } from '../model/promoCodeSchemas';

/**
 * Production Supabase implementation of PromoCodeRepository.
 *
 * All codes are visible to all authenticated users (RLS SELECT policy: using (true)).
 * markUsed adds .eq('status', 'reserved') to the WHERE clause so that a concurrent
 * second attempt sees 0 rows and gets a PGRST116 error, surfaced as a friendly message.
 */
export class SupabasePromoCodeRepository implements PromoCodeRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly supabase: any) {}

  async getAssigned(_userId: string): Promise<PromoCode[]> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    if (!data) return [];
    return (data as unknown[]).map((row) => promoCodeSchema.parse(this.mapRow(row)));
  }

  async resetAll(): Promise<void> {
    const { error } = await this.supabase
      .from('promo_codes')
      .update({
        status: 'available',
        assigned_to: null,
        assigned_at: null,
        used_at: null,
        expires_at: null,
      })
      .not('status', 'is', null);

    if (error) throw new Error(error.message);
  }

  async markUsed(codeId: string): Promise<PromoCode> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('id', codeId)
      .in('status', ['available', 'reserved'])
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('This promo code has already been used');
    return promoCodeSchema.parse(this.mapRow(data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapRow(row: any): unknown {
    return {
      id: row.id,
      code: row.code,
      status: row.status,
      assignedTo: row.assigned_to ?? null,
      assignedAt: row.assigned_at,
      usedAt: row.used_at,
      expiresAt: row.expires_at,
    };
  }
}
