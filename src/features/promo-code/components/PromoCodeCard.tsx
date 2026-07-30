import { useState, useCallback } from 'react';
import type { PromoCode } from '../model/PromoCode';
import { Button } from '@/shared/components/Button';
import styles from './PromoCodeCard.module.css';

interface PromoCodeCardProps {
  promoCode: PromoCode;
  onMarkUsed: (id: string) => void;
  isMarkingUsed: boolean;
}

function CopyIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

const STATUS_LABEL: Record<string, string> = {
  reserved: 'Active',
  used: 'Used',
  expired: 'Expired',
  available: 'Available',
};

const STATUS_CLASS: Record<string, string> = {
  reserved: styles.badgeActive,
  used: styles.badgeUsed,
  expired: styles.badgeExpired,
  available: styles.badgeActive,
};

export function PromoCodeCard({ promoCode, onMarkUsed, isMarkingUsed }: PromoCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const isUsed = promoCode.status === 'used';
  const isExpired = promoCode.status === 'expired';
  const canMarkUsed = !isUsed && !isExpired;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(promoCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard API unavailable (non-https) — silently skip
    }
  }, [promoCode.code]);

  const cardClass = [
    styles.card,
    isUsed ? styles.cardUsed : '',
    isExpired ? styles.cardExpired : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={cardClass} aria-label={`Promo code ${promoCode.code}`}>
      <header className={styles.cardHeader}>
        <span className={[styles.badge, STATUS_CLASS[promoCode.status]].join(' ')}>
          {STATUS_LABEL[promoCode.status]}
        </span>

        {promoCode.expiresAt && (
          <span className={styles.expiry}>
            {isExpired ? 'Expired ' : 'Expires '}
            <time dateTime={promoCode.expiresAt}>
              {new Date(promoCode.expiresAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </span>
        )}
      </header>

      <div className={styles.codeRow}>
        <output className={styles.code} aria-label={`Code: ${promoCode.code}`}>
          {promoCode.code}
        </output>

        <div className={styles.copyWrapper}>
          <button
            type="button"
            className={[styles.copyBtn, copied ? styles.copyBtnCopied : ''].join(' ')}
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : `Copy code ${promoCode.code}`}
            disabled={copied}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          {copied && (
            <span className={styles.tooltip} role="tooltip">
              Copied!
            </span>
          )}
        </div>
      </div>

      {promoCode.usedAt && (
        <p className={styles.usedDate}>
          Used on{' '}
          <time dateTime={promoCode.usedAt}>
            {new Date(promoCode.usedAt).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </p>
      )}

      <footer className={styles.cardFooter}>
        <Button
          variant={isExpired ? 'secondary' : 'danger'}
          size="sm"
          onClick={() => onMarkUsed(promoCode.id)}
          loading={isMarkingUsed}
          disabled={!canMarkUsed || isMarkingUsed}
          aria-label={
            isExpired
              ? 'Cannot mark expired code as used'
              : isUsed
                ? 'Code already marked as used'
                : `Mark ${promoCode.code} as used`
          }
        >
          {isMarkingUsed ? 'Marking…' : 'Mark as used'}
        </Button>
      </footer>
    </article>
  );
}
