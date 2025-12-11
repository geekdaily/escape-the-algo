import { Video, HistoryEntry, ExclusionReason } from '@/types';

const HISTORY_KEY = 'escape-the-algo-history';
const OLD_EXCLUDED_KEY = 'escape-the-algo-excluded';

function migrateFromExcluded(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const oldData = localStorage.getItem(OLD_EXCLUDED_KEY);
    if (!oldData) return [];

    const oldEntries = JSON.parse(oldData);
    const migrated: HistoryEntry[] = oldEntries.map((entry: any) => ({
      id: entry.id,
      title: '',
      channelTitle: '',
      channelId: '',
      reason: entry.reason || 'offered',
      timestamp: entry.timestamp || Date.now(),
    }));

    // Save migrated data to new key
    localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
    // Remove old key
    localStorage.removeItem(OLD_EXCLUDED_KEY);

    return migrated;
  } catch {
    return [];
  }
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) {
      // Check for old data to migrate
      return migrateFromExcluded();
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getExcludedVideoIds(): string[] {
  return getHistory().map(v => v.id);
}

export function addToHistory(video: Video, reason: ExclusionReason): void {
  if (typeof window === 'undefined') return;

  const history = getHistory();
  const existingIndex = history.findIndex(v => v.id === video.id);

  const entry: HistoryEntry = {
    id: video.id,
    title: video.title,
    channelTitle: video.channelTitle,
    channelId: video.channelId,
    reason,
    timestamp: Date.now(),
  };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
  } else {
    history.push(entry);
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function updateVideoReason(id: string, reason: ExclusionReason): void {
  if (typeof window === 'undefined') return;

  const history = getHistory();
  const entry = history.find(v => v.id === id);
  if (entry) {
    entry.reason = reason;
    entry.timestamp = Date.now();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(OLD_EXCLUDED_KEY);
}
