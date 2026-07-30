import { describe, it, expect, beforeEach } from 'vitest';
import { MockPromoCodeRepository } from '@/features/promo-code/api/MockPromoCodeRepository';

describe('MockPromoCodeRepository', () => {
  let repo: MockPromoCodeRepository;

  beforeEach(() => {
    repo = new MockPromoCodeRepository();
  });

  describe('getAssigned', () => {
    it('returns only available codes', async () => {
      const result = await repo.getAssigned('any-user');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((c) => c.status === 'available')).toBe(true);
    });

    it('returns the same list regardless of which user calls it', async () => {
      const forA = await repo.getAssigned('user-a');
      const forB = await repo.getAssigned('user-b');
      expect(forA.map((c) => c.id)).toEqual(forB.map((c) => c.id));
    });
  });

  describe('resetAll', () => {
    it('makes all codes available again', async () => {
      const codes = await repo.getAssigned('user');
      await repo.markUsed(codes[0].id);

      await repo.resetAll();

      const after = await repo.getAssigned('user');
      expect(after.every((c) => c.status === 'available')).toBe(true);
    });

    it('restores previously used codes to the available list', async () => {
      const codes = await repo.getAssigned('user');
      const target = codes[0];
      await repo.markUsed(target.id);

      await repo.resetAll();

      const after = await repo.getAssigned('user');
      expect(after.some((c) => c.id === target.id)).toBe(true);
    });
  });

  describe('markUsed', () => {
    it('sets an available code status to "used" and records usedAt', async () => {
      const codes = await repo.getAssigned('user-a');
      const result = await repo.markUsed(codes[0].id);
      expect(result.status).toBe('used');
      expect(result.usedAt).not.toBeNull();
    });

    it('throws if code is already used', async () => {
      const codes = await repo.getAssigned('user-a');
      await repo.markUsed(codes[0].id);
      await expect(repo.markUsed(codes[0].id)).rejects.toThrow('already been used');
    });

    it('throws if code id is unknown', async () => {
      await expect(repo.markUsed('unknown-id')).rejects.toThrow('not found');
    });

    it('two separate calls on the same code: second one throws', async () => {
      const codes = await repo.getAssigned('user-a');
      await repo.markUsed(codes[0].id);
      await expect(repo.markUsed(codes[0].id)).rejects.toThrow();
    });

    it('removes the code from available list after marking as used', async () => {
      const codes = await repo.getAssigned('user-a');
      const target = codes[0];
      await repo.markUsed(target.id);
      const after = await repo.getAssigned('user-a');
      expect(after.find((c) => c.id === target.id)).toBeUndefined();
    });
  });
});
