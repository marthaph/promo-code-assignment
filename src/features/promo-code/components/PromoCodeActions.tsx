import { Button } from '@/shared/components/Button';
import styles from './PromoCodeActions.module.css';

interface PromoCodeActionsProps {
  onGetCode: () => void;
  onMarkUsed: () => void;
  isAssigning: boolean;
  isMarkingUsed: boolean;
  canGetCode: boolean;
  canMarkUsed: boolean;
}

export function PromoCodeActions({
  onGetCode,
  onMarkUsed,
  isAssigning,
  isMarkingUsed,
  canGetCode,
  canMarkUsed,
}: PromoCodeActionsProps) {
  return (
    <div className={styles.actions}>
      {canGetCode && (
        <Button
          variant="primary"
          size="lg"
          onClick={onGetCode}
          loading={isAssigning}
          disabled={isAssigning}
        >
          {isAssigning ? 'Assigning…' : 'Get a code'}
        </Button>
      )}

      {canMarkUsed && (
        <Button
          variant="danger"
          size="lg"
          onClick={onMarkUsed}
          loading={isMarkingUsed}
          disabled={isMarkingUsed}
        >
          {isMarkingUsed ? 'Marking as used…' : 'Mark as used'}
        </Button>
      )}
    </div>
  );
}
