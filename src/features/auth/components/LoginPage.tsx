import { useState, type FormEvent } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { Button } from '@/shared/components/Button';
import { Alert } from '@/shared/components/Alert';
import styles from './LoginPage.module.css';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage(
          'Account created. Check your email for a confirmation link, or sign in directly if email confirmation is disabled.',
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  const toggleMode = () => {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            🎟
          </div>
          <h1 className={styles.heading}>Promo Codes</h1>
          <p className={styles.subheading}>
            {mode === 'signin'
              ? 'Sign in to access your codes'
              : 'Create an account to get started'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <Alert variant="error">{error}</Alert>}
          {successMessage && (
            <Alert variant="success" role="status">
              {successMessage}
            </Alert>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading || !email || password.length < 6}
          >
            {loading
              ? mode === 'signin'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </Button>
        </form>

        <footer className={styles.footer}>
          <p>
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" className={styles.toggleBtn} onClick={toggleMode}>
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </footer>
      </div>
    </main>
  );
}
