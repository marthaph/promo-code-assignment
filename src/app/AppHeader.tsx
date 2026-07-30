import { useState } from 'react';
import { supabase } from '@/shared/lib/supabase';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  email: string;
  onReset: () => Promise<void>;
}

export function AppHeader({ email, onReset }: AppHeaderProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
  }

  async function handleReset() {
    setResetting(true);
    try {
      await onReset();
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.resetBtn}
        onClick={handleReset}
        disabled={resetting}
        aria-label="Reset all promo codes to available"
      >
        {resetting ? 'Resetting…' : 'Reset'}
      </button>

      <span className={styles.email} title={email}>
        <span className={styles.dot} aria-hidden="true" />
        {email}
      </span>

      <button
        type="button"
        className={styles.signOutBtn}
        onClick={handleSignOut}
        disabled={signingOut}
        aria-label="Sign out"
      >
        {signingOut ? 'Signing out…' : 'Sign out'}
      </button>
    </div>
  );
}
