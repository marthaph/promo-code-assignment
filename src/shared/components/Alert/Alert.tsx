import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  role?: 'alert' | 'status';
}

const icons: Record<AlertVariant, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export function Alert({ variant, title, children, role = 'alert' }: AlertProps) {
  return (
    <div className={[styles.alert, styles[variant]].join(' ')} role={role} aria-live="polite">
      <span className={styles.icon} aria-hidden="true">
        {icons[variant]}
      </span>
      <div className={styles.content}>
        {title && <p className={styles.title}>{title}</p>}
        <p className={styles.message}>{children}</p>
      </div>
    </div>
  );
}
