import type { PromoCode } from '../model/PromoCode';
import type { PromoCodeRepository } from './PromoCodeRepository';

const SIMULATED_DELAY_MS = 600;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function nowIso() {
  return new Date().toISOString();
}

function expiresIso(hours = 24) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function pastIso(hoursAgo = 48) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
}

function createSharedPool(): PromoCode[] {
  return [
    {
      id: 'seed-001',
      code: 'SUMMER25',
      status: 'reserved',
      assignedTo: 'demo-alice',
      assignedAt: pastIso(72),
      usedAt: null,
      expiresAt: expiresIso(24),
    },
    {
      id: 'seed-002',
      code: 'LAUNCH50',
      status: 'reserved',
      assignedTo: 'demo-bob',
      assignedAt: pastIso(48),
      usedAt: null,
      expiresAt: expiresIso(48),
    },
    {
      id: 'seed-003',
      code: 'OLDCODE99',
      status: 'expired',
      assignedTo: 'demo-alice',
      assignedAt: pastIso(120),
      usedAt: null,
      expiresAt: pastIso(48),
    },
    {
      id: 'pool-001',
      code: 'PROMO2024',
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      usedAt: null,
      expiresAt: null,
    },
    {
      id: 'pool-002',
      code: 'WELCOME10',
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      usedAt: null,
      expiresAt: null,
    },
    {
      id: 'pool-003',
      code: 'EARLYBIRD',
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      usedAt: null,
      expiresAt: null,
    },
    {
      id: 'pool-004',
      code: 'INSIDER20',
      status: 'available',
      assignedTo: null,
      assignedAt: null,
      usedAt: null,
      expiresAt: null,
    },
  ];
}

export class MockPromoCodeRepository implements PromoCodeRepository {
  private pool: PromoCode[] = createSharedPool();

  async getAssigned(_userId: string): Promise<PromoCode[]> {
    await sleep(SIMULATED_DELAY_MS);
    return this.pool.filter((c) => c.status === 'available').map((c) => ({ ...c }));
  }

  async resetAll(): Promise<void> {
    await sleep(SIMULATED_DELAY_MS);
    this.pool = this.pool.map((c) => ({
      ...c,
      status: 'available' as const,
      assignedTo: null,
      assignedAt: null,
      usedAt: null,
      expiresAt: null,
    }));
  }

  async markUsed(codeId: string): Promise<PromoCode> {
    await sleep(SIMULATED_DELAY_MS);

    const code = this.pool.find((c) => c.id === codeId);
    if (!code) throw new Error('Promo code not found');
    if (code.status === 'used') throw new Error('This promo code has already been used');
    if (code.status === 'expired') throw new Error('Promo code has expired');

    code.status = 'used';
    code.usedAt = nowIso();
    return { ...code };
  }
}

export class NoCodesAvailableError extends Error {
  constructor() {
    super('No promo codes are available at this time');
    this.name = 'NoCodesAvailableError';
  }
}
