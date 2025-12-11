'use client';

import { useEffect, useState } from 'react';
import { HistoryEntry } from '@/types';
import { getHistory } from '@/lib/storage';
import styles from './HistoryPanel.module.css';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryPanel({ isOpen, onClose }: HistoryPanelProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Load history when panel opens, sorted newest first
      const entries = getHistory().sort((a, b) => b.timestamp - a.timestamp);
      setHistory(entries);
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
        <div className={styles.header}>
          <h2>History</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.list}>
          {history.length === 0 ? (
            <p className={styles.empty}>No videos yet</p>
          ) : (
            history.map((entry) => (
              <div key={`${entry.id}-${entry.timestamp}`} className={styles.item}>
                <a
                  href={`https://www.youtube.com/watch?v=${entry.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.thumbnail}
                >
                  <img
                    src={getThumbnailUrl(entry.id)}
                    alt={entry.title || 'Video thumbnail'}
                  />
                </a>
                <div className={styles.info}>
                  <a
                    href={`https://www.youtube.com/watch?v=${entry.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.title}
                  >
                    {entry.title || 'Unknown title'}
                  </a>
                  {entry.channelId ? (
                    <a
                      href={`https://www.youtube.com/channel/${entry.channelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.channel}
                    >
                      {entry.channelTitle || 'Unknown channel'}
                    </a>
                  ) : (
                    <span className={styles.channel}>
                      {entry.channelTitle || 'Unknown channel'}
                    </span>
                  )}
                  <span className={styles.date}>{formatDate(entry.timestamp)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
