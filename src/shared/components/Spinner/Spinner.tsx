import styles from './Spinner.module.css';

interface SpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ label = 'Loading…', size = 'md' }: SpinnerProps) {
  return (
    <div className={styles.wrapper} role="status">
      <div className={[styles.spinner, styles[size]].join(' ')} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  );
}
