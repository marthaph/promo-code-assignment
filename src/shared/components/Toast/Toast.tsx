import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export interface ToastItem {
  id: string;
  message: string;
  variant?: 'success' | 'warning';
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [exiting, setExiting] = useState(false);
  const isWarning = toast.variant === 'warning';

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2600);
    const removeTimer = setTimeout(() => onDismiss(toast.id), 3000);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={[styles.toast, isWarning ? styles.toastWarning : '', exiting ? styles.exiting : '']
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        {isWarning ? '⚠' : '✓'}
      </span>
      {toast.message}
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className={styles.container} aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
