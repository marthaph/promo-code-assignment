import { useCallback, useEffect, useMemo, useState } from 'react';
import { PromoCodeList } from './PromoCodeList';
import { PromoCodeStatusMessage } from './PromoCodeStatus';
import { useAssignedPromoCode } from '../hooks/useAssignedPromoCode';
import { useMarkPromoCodeUsed } from '../hooks/useMarkPromoCodeUsed';
import type { PromoCodeRepository } from '../api/PromoCodeRepository';
import type { PromoCodeViewState } from '../model/PromoCode';
import { Button } from '@/shared/components/Button';
import { ToastContainer, type ToastItem } from '@/shared/components/Toast';
import styles from './PromoCodePage.module.css';

interface PromoCodePageProps {
  repository: PromoCodeRepository;
  userId: string;
}

function deriveErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}

export function PromoCodePage({ repository, userId }: PromoCodePageProps) {
  const [codesRequested, setCodesRequested] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const assignedQuery = useAssignedPromoCode(repository, userId, codesRequested);
  const markUsedMutation = useMarkPromoCodeUsed(repository, userId);

  const allCodes = assignedQuery.data ?? [];
  const visibleCodes = allCodes.slice(0, visibleCount);

  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show warning when a completed fetch returns an empty pool
  useEffect(() => {
    if (!codesRequested || !assignedQuery.isSuccess) return;
    if (allCodes.length === 0) {
      addToast('There are no new codes left', 'warning');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedQuery.dataUpdatedAt]);

  const handleGetCode = useCallback(() => {
    if (!codesRequested) {
      setCodesRequested(true);
      setVisibleCount(1);
    } else if (visibleCount < allCodes.length) {
      setVisibleCount((n) => n + 1);
    } else if (assignedQuery.isSuccess) {
      addToast('There are no new codes left', 'warning');
    }
  }, [codesRequested, visibleCount, allCodes.length, assignedQuery.isSuccess, addToast]);

  const handleMarkUsed = useCallback(
    (codeId: string) => {
      setMarkingId(codeId);
      markUsedMutation.mutate(codeId, {
        onSuccess: () => {
          setMarkingId(null);
          addToast('That code is used');
        },
        onError: (error) => {
          setMarkingId(null);
          const msg = deriveErrorMessage(error);
          const isAlreadyUsed = msg.toLowerCase().includes('already');
          addToast(
            isAlreadyUsed ? 'This promo code has already been used, try another one' : msg,
            'warning',
          );
        },
      });
    },
    [markUsedMutation, addToast],
  );

  const viewState = useMemo<PromoCodeViewState>(() => {
    if (!codesRequested) return { type: 'idle' };
    if (assignedQuery.isLoading) return { type: 'loading' };
    if (assignedQuery.isError)
      return { type: 'error', message: deriveErrorMessage(assignedQuery.error) };
    if (visibleCodes.length === 0) return { type: 'empty' };
    return { type: 'codes', codes: visibleCodes };
  }, [codesRequested, assignedQuery, visibleCodes]);

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <main className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Promo Codes</h1>
          <p className={styles.subheading}>Browse and use discount codes from the shared pool.</p>
        </header>

        <section className={styles.content} aria-label="Promo code management">
          {viewState.type === 'codes' && (
            <PromoCodeList codes={visibleCodes} markingId={markingId} onMarkUsed={handleMarkUsed} />
          )}

          {viewState.type !== 'codes' && <PromoCodeStatusMessage viewState={viewState} />}

          <div className={styles.getCodeArea}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetCode}
              loading={assignedQuery.isFetching}
              disabled={assignedQuery.isFetching}
            >
              {assignedQuery.isFetching ? 'Loading…' : 'Get a code'}
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
