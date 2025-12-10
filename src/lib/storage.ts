import { ExcludedVideo, ExclusionReason } from '@/types';

const STORAGE_KEY = 'escape-the-algo-excluded';

export function getExcludedVideos(): ExcludedVideo[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function getExcludedVideoIds(): string[] {
  return getExcludedVideos().map(v => v.id);
}

export function addExcludedVideo(id: string, reason: ExclusionReason): void {
  if (typeof window === 'undefined') return;

  const videos = getExcludedVideos();
  const existingIndex = videos.findIndex(v => v.id === id);

  if (existingIndex >= 0) {
    videos[existingIndex].reason = reason;
    videos[existingIndex].timestamp = Date.now();
  } else {
    videos.push({
      id,
      reason,
      timestamp: Date.now(),
    });
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
}

export function updateVideoReason(id: string, reason: ExclusionReason): void {
  addExcludedVideo(id, reason);
}

export function clearExcludedVideos(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
