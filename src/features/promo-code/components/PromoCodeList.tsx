import type { PromoCode } from '../model/PromoCode';
import { PromoCodeCard } from './PromoCodeCard';
import styles from './PromoCodeList.module.css';

interface PromoCodeListProps {
  codes: PromoCode[];
  markingId: string | null;
  onMarkUsed: (id: string) => void;
}

export function PromoCodeList({ codes, markingId, onMarkUsed }: PromoCodeListProps) {
  return (
    <ul className={styles.list} aria-label="Promo codes">
      {codes.map((code) => (
        <li key={code.id} className={styles.item}>
          <PromoCodeCard
            promoCode={code}
            onMarkUsed={onMarkUsed}
            isMarkingUsed={markingId === code.id}
          />
        </li>
      ))}
    </ul>
  );
}
