import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PromoCodePage } from '@/features/promo-code/components/PromoCodePage';
import type { PromoCodeRepository } from '@/features/promo-code/api/PromoCodeRepository';
import type { PromoCode } from '@/features/promo-code/model/PromoCode';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderPage(repository: PromoCodeRepository) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <PromoCodePage repository={repository} userId="test-user" />
    </QueryClientProvider>,
  );
}

const reservedCode: PromoCode = {
  id: 'code-001',
  code: 'SAVE20',
  status: 'reserved',
  assignedTo: 'test-user',
  assignedAt: new Date().toISOString(),
  usedAt: null,
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

const reservedCode2: PromoCode = {
  id: 'code-002',
  code: 'PROMO10',
  status: 'reserved',
  assignedTo: 'test-user',
  assignedAt: new Date().toISOString(),
  usedAt: null,
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
};

const expiredCode: PromoCode = {
  id: 'code-expired',
  code: 'OLDCODE',
  status: 'expired',
  assignedTo: 'demo-alice',
  assignedAt: new Date(Date.now() - 172800000).toISOString(),
  usedAt: null,
  expiresAt: new Date(Date.now() - 86400000).toISOString(),
};

const usedCode: PromoCode = { ...reservedCode, status: 'used', usedAt: new Date().toISOString() };

function makeRepo(overrides: Partial<PromoCodeRepository> = {}): PromoCodeRepository {
  return {
    getAssigned: vi.fn().mockResolvedValue([]),
    markUsed: vi.fn(),
    resetAll: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('PromoCodePage', () => {
  const user = userEvent.setup();

  beforeEach(() => vi.clearAllMocks());

  describe('idle state', () => {
    it('shows "Get a code" button before anything is loaded', () => {
      renderPage(makeRepo({ getAssigned: vi.fn() }));
      expect(screen.getByRole('button', { name: /get a code/i })).toBeInTheDocument();
    });

    it('does not call getAssigned before button is clicked', () => {
      const repo = makeRepo({ getAssigned: vi.fn() });
      renderPage(repo);
      expect(repo.getAssigned).not.toHaveBeenCalled();
    });
  });

  describe('one-by-one reveal', () => {
    it('shows first code after first click', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode, reservedCode2]),
      });
      renderPage(repo);

      await user.click(screen.getByRole('button', { name: /get a code/i }));

      await waitFor(() => {
        expect(screen.getByText('SAVE20')).toBeInTheDocument();
        expect(screen.queryByText('PROMO10')).not.toBeInTheDocument();
      });
    });

    it('reveals one more code on each subsequent click', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode, reservedCode2]),
      });
      renderPage(repo);

      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => screen.getByText('SAVE20'));

      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => {
        expect(screen.getByText('SAVE20')).toBeInTheDocument();
        expect(screen.getByText('PROMO10')).toBeInTheDocument();
      });
    });

    it('shows warning toast when all codes have been revealed', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode]),
      });
      renderPage(repo);

      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => screen.getByText('SAVE20'));

      // Second click — no more codes to reveal
      await user.click(screen.getByRole('button', { name: /get a code/i }));

      await waitFor(() => {
        expect(screen.getByText(/no new codes left/i)).toBeInTheDocument();
      });
    });

    it('shows warning toast when pool returns no codes', async () => {
      const repo = makeRepo({ getAssigned: vi.fn().mockResolvedValue([]) });
      renderPage(repo);
      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => {
        expect(screen.getByText(/no new codes left/i)).toBeInTheDocument();
      });
    });
  });

  describe('code list', () => {
    it('"Get a code" button remains visible after codes are shown', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode]),
      });
      renderPage(repo);
      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => screen.getByText('SAVE20'));
      expect(screen.getByRole('button', { name: /get a code/i })).toBeInTheDocument();
    });

    it('expired code has disabled "Mark as used" button', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([expiredCode]),
      });
      renderPage(repo);
      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /cannot mark expired/i });
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('mark as used flow', () => {
    it('shows success toast after marking code as used', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode]),
        markUsed: vi.fn().mockResolvedValue(usedCode),
      });
      renderPage(repo);
      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => screen.getByText('SAVE20'));

      await user.click(screen.getByRole('button', { name: /mark save20 as used/i }));

      await waitFor(() => {
        expect(screen.getByText(/that code is used/i)).toBeInTheDocument();
      });
    });

    it('shows warning toast with updated text when code is already used', async () => {
      const repo = makeRepo({
        getAssigned: vi.fn().mockResolvedValue([reservedCode]),
        markUsed: vi.fn().mockRejectedValue(new Error('This promo code has already been used')),
      });
      renderPage(repo);
      await user.click(screen.getByRole('button', { name: /get a code/i }));
      await waitFor(() => screen.getByText('SAVE20'));

      await user.click(screen.getByRole('button', { name: /mark save20 as used/i }));

      await waitFor(() => {
        expect(screen.getByText(/try another one/i)).toBeInTheDocument();
      });
    });
  });
});
