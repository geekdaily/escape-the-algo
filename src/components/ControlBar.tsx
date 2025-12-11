'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShuffle, faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import styles from './ControlBar.module.css';

interface ControlBarProps {
  onShowAnother: () => void;
  onOpenHistory: () => void;
}

export default function ControlBar({ onShowAnother, onOpenHistory }: ControlBarProps) {
  return (
    <div className={styles.controlBar}>
      <button
        className={styles.controlButton}
        onClick={onShowAnother}
        title="Show me another"
      >
        <FontAwesomeIcon icon={faShuffle} />
        <span className={styles.tooltip}>Show me another</span>
      </button>

      <button
        className={styles.controlButton}
        onClick={onOpenHistory}
        title="View history"
      >
        <FontAwesomeIcon icon={faClockRotateLeft} />
        <span className={styles.tooltip}>View history</span>
      </button>
    </div>
  );
}
