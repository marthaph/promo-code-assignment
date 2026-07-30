import { http, HttpResponse } from 'msw';
import type { PromoCode } from '@/features/promo-code/model/PromoCode';

let nextCodeIndex = 0;

const mockPool: PromoCode[] = [
  {
    id: 'test-id-001',
    code: 'TEST25',
    status: 'available',
    assignedTo: null,
    assignedAt: null,
    usedAt: null,
    expiresAt: null,
  },
];

export const handlers = [
  http.post('/api/promo-codes/assign', () => {
    const available = mockPool[nextCodeIndex];
    if (!available || available.status !== 'available') {
      return HttpResponse.json({ error: 'No codes available' }, { status: 409 });
    }
    available.status = 'reserved';
    available.assignedAt = new Date().toISOString();
    available.expiresAt = new Date(Date.now() + 86400000).toISOString();
    nextCodeIndex++;
    return HttpResponse.json({ promoCode: available });
  }),

  http.patch('/api/promo-codes/:id/used', ({ params }) => {
    const code = mockPool.find((c) => c.id === params['id']);
    if (!code) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    code.status = 'used';
    code.usedAt = new Date().toISOString();
    return HttpResponse.json({ promoCode: code });
  }),
];

export function resetHandlerState() {
  nextCodeIndex = 0;
  mockPool.forEach((c) => {
    c.status = 'available';
    c.assignedAt = null;
    c.usedAt = null;
    c.expiresAt = null;
  });
}
