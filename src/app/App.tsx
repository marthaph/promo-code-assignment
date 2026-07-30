import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PromoCodePage, MockPromoCodeRepository } from '@/features/promo-code';
import { SupabasePromoCodeRepository } from '@/features/promo-code/api/SupabasePromoCodeRepository';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { useSession } from '@/features/auth/hooks/useSession';
import { ASSIGNED_PROMO_CODE_KEY } from '@/features/promo-code/hooks/useAssignedPromoCode';
import { AppHeader } from './AppHeader';
import { Spinner } from '@/shared/components/Spinner';
import { supabase } from '@/shared/lib/supabase';
import { env } from '@/shared/config/env';
import styles from './App.module.css';

const MOCK_USER_ID = 'user-session-001';

const repository =
  env.apiAdapter === 'supabase'
    ? new SupabasePromoCodeRepository(supabase)
    : new MockPromoCodeRepository();

export function App() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();

  const userId = useMemo(() => {
    if (env.apiAdapter === 'supabase') {
      return session?.user.id ?? null;
    }
    return MOCK_USER_ID;
  }, [session]);

  const handleReset = useCallback(async () => {
    await repository.resetAll();
    await queryClient.invalidateQueries({ queryKey: [ASSIGNED_PROMO_CODE_KEY] });
  }, [queryClient]);

  if (loading) {
    return (
      <div className={styles.centred}>
        <Spinner label="Loading…" size="lg" />
      </div>
    );
  }

  if (env.apiAdapter === 'supabase' && !session) {
    return <LoginPage />;
  }

  return (
    <>
      {env.apiAdapter === 'supabase' && session && (
        <AppHeader email={session.user.email ?? session.user.id} onReset={handleReset} />
      )}
      <div className={env.apiAdapter === 'supabase' ? styles.withHeader : undefined}>
        <PromoCodePage repository={repository} userId={userId ?? MOCK_USER_ID} />
      </div>
    </>
  );
}
