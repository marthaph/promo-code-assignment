import { Alert } from '@/shared/components/Alert';
import { Spinner } from '@/shared/components/Spinner';
import type { PromoCodeViewState } from '../model/PromoCode';

interface PromoCodeStatusProps {
  viewState: PromoCodeViewState;
}

export function PromoCodeStatusMessage({ viewState }: PromoCodeStatusProps) {
  switch (viewState.type) {
    case 'idle':
      return null;

    case 'loading':
      return <Spinner label="Loading codes…" size="md" />;

    case 'empty':
      return null;

    case 'error':
      return (
        <Alert variant="error" title="Something went wrong">
          {viewState.message}
        </Alert>
      );

    default:
      return null;
  }
}
