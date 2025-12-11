# Show History Implementation Plan

**Date:** 2025-12-11
**Branch:** `claude/show-history-01DPDr7qEk7tngrjPvRwnNm8`
**Status:** Draft

---

## Original Prompt

> Let's add a control that lets you look at a scrollable list of the videos you've been shown. The list should have the title, creator, and a thumbnail of the video, along with the day and time the video was offered.
>
> We're going to refactor the excluded videos list to be a history list, and we'll attach all metadata needed for this and other future history related features to entries in the history list. To do this, we'll use a new storage key for the history list, and anytime we find someone who is using the old storage key for the excluded list, we'll migrate their excluded list to the new history list before adding more data to it.

---

## Design Decisions

1. **Controls row:** Replace "Show me another" button with a row of FontAwesome icon buttons with hover tooltips
2. **History panel:** Slide-out panel from the right side
3. **Thumbnail URL:** Derive from video ID (`https://img.youtube.com/vi/{ID}/mqdefault.jpg`)
4. **Links:** Thumbnail/title → YouTube video, creator → channel page (all `target="_blank"`)
5. **Storage key:** `escape-the-algo-history`
6. **Reason field:** Keep but don't display
7. **Channel linking:** Need to capture `channelId` from YouTube API (currently missing)

---

## Data Structures

### New HistoryEntry Type
```typescript
export interface HistoryEntry {
  id: string;                    // YouTube video ID
  title: string;                 // Video title
  channelTitle: string;          // Channel name
  channelId: string;             // For linking to channel page
  reason: ExclusionReason;       // 'offered' | 'played' (kept but not displayed)
  timestamp: number;             // When video was offered
}
```

### Migration
- Old key: `escape-the-algo-excluded` → New key: `escape-the-algo-history`
- Old entries lack `title`, `channelTitle`, `channelId` - these will be empty strings for migrated entries
- Migration runs once on first access, then old key is deleted

---

## Implementation Tasks

### Task 1: Install FontAwesome

**Action:** Add FontAwesome React package

```bash
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/react-fontawesome
```

**Verification:** `npm ls @fortawesome/react-fontawesome` shows installed version

---

### Task 2: Add channelId to Video type

**File:** `src/types/index.ts`

**Action:** Add `channelId` field to Video interface

```typescript
export interface Video {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;        // ADD THIS
  publishedAt: string;
  thumbnailUrl: string;
}
```

**Verification:** TypeScript compiles without errors

---

### Task 3: Capture channelId in YouTube API route

**File:** `src/app/api/youtube-search/route.ts`

**Action:** Add `channelId` to the mapping (line ~55)

```typescript
.map((item: any) => ({
  id: item.id.videoId,
  title: item.snippet.title,
  channelTitle: item.snippet.channelTitle,
  channelId: item.snippet.channelId,     // ADD THIS
  publishedAt: item.snippet.publishedAt,
  thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
}));
```

**Verification:** API returns videos with `channelId` field populated

---

### Task 4: Add HistoryEntry type

**File:** `src/types/index.ts`

**Action:** Add new HistoryEntry interface

```typescript
export interface HistoryEntry {
  id: string;
  title: string;
  channelTitle: string;
  channelId: string;
  reason: ExclusionReason;
  timestamp: number;
}
```

**Verification:** TypeScript compiles

---

### Task 5: Rewrite storage.ts with history and migration

**File:** `src/lib/storage.ts`

**Action:** Complete rewrite with:
- New storage key `escape-the-algo-history`
- Migration function from old format
- Updated functions to work with HistoryEntry
- Accept Video object when adding to history

```typescript
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
      title: '',           // Unknown for migrated entries
      channelTitle: '',    // Unknown for migrated entries
      channelId: '',       // Unknown for migrated entries
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
  localStorage.removeItem(OLD_EXCLUDED_KEY); // Clean up old key too
}
```

**Verification:** TypeScript compiles, no runtime errors on page load

---

### Task 6: Update page.tsx to use new storage API

**File:** `src/app/page.tsx`

**Action:**
- Change import from `addExcludedVideo` to `addToHistory`
- Update call site to pass full video object

```typescript
// Change import
import { addToHistory, getExcludedVideoIds } from '@/lib/storage';

// Change call (around line 53)
addToHistory(video, 'offered');
```

**Verification:** App loads and marks videos as offered correctly

---

### Task 7: Update VideoEmbed to use new storage API

**File:** `src/components/VideoEmbed.tsx`

**Action:** Check if VideoEmbed uses storage and update if needed

**Verification:** Video plays and updates reason to 'played' after 5 seconds

---

### Task 8: Create HistoryPanel component

**File:** `src/components/HistoryPanel.tsx` (new file)

**Action:** Create slide-out panel component

```typescript
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
              <div key={entry.id} className={styles.item}>
                <a
                  href={`https://www.youtube.com/watch?v=${entry.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.thumbnail}
                >
                  <img
                    src={entry.title ? entry.thumbnailUrl || getThumbnailUrl(entry.id) : getThumbnailUrl(entry.id)}
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
```

**Verification:** Component renders without errors (will wire up in later task)

---

### Task 9: Create HistoryPanel styles

**File:** `src/components/HistoryPanel.module.css` (new file)

**Action:** Create CSS module for panel

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 100;
}

.overlayVisible {
  opacity: 1;
  visibility: visible;
}

.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 90vw;
  background: var(--surface);
  border-left: 1px solid var(--border);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 101;
  display: flex;
  flex-direction: column;
}

.panelOpen {
  transform: translateX(0);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--foreground);
}

.closeButton {
  background: none;
  border: none;
  color: var(--foreground-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  line-height: 1;
  transition: color 0.2s ease;
}

.closeButton:hover {
  color: var(--foreground);
}

.list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty {
  color: var(--foreground-muted);
  text-align: center;
  padding: 2rem;
}

.item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.item:last-child {
  border-bottom: none;
}

.thumbnail {
  flex-shrink: 0;
  width: 120px;
  height: 68px;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--foreground);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.title:hover {
  color: var(--accent-hover);
}

.channel {
  font-size: 0.75rem;
  color: var(--foreground-muted);
}

a.channel:hover {
  color: var(--accent);
}

.date {
  font-size: 0.7rem;
  color: var(--foreground-muted);
  margin-top: auto;
}
```

**Verification:** Styles apply correctly when component is rendered

---

### Task 10: Create ControlBar component

**File:** `src/components/ControlBar.tsx` (new file)

**Action:** Create icon button bar with tooltips

```typescript
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
```

**Verification:** Component renders icons correctly

---

### Task 11: Create ControlBar styles

**File:** `src/components/ControlBar.module.css` (new file)

**Action:** Create CSS module

```css
.controlBar {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.controlButton {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}

.controlButton:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
}

.controlButton:active {
  transform: translateY(0);
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 0.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  pointer-events: none;
}

.controlButton:hover .tooltip {
  opacity: 1;
  visibility: visible;
}
```

**Verification:** Buttons display correctly with hover tooltips

---

### Task 12: Integrate components into page.tsx

**File:** `src/app/page.tsx`

**Action:**
- Import ControlBar and HistoryPanel
- Add state for history panel open/close
- Replace actions div with ControlBar
- Add HistoryPanel to render

```typescript
// Add imports
import ControlBar from '@/components/ControlBar';
import HistoryPanel from '@/components/HistoryPanel';

// Add state (inside Home component)
const [historyOpen, setHistoryOpen] = useState(false);

// Replace the actions div (around line 177-183) with:
{state === 'video' && currentVideo && (
  <ControlBar
    onShowAnother={handleShowAnother}
    onOpenHistory={() => setHistoryOpen(true)}
  />
)}

// Add HistoryPanel before closing </div> of container:
<HistoryPanel
  isOpen={historyOpen}
  onClose={() => setHistoryOpen(false)}
/>
```

**Verification:** Controls display, clicking history icon opens panel, panel shows video history

---

### Task 13: Configure FontAwesome library

**File:** `src/app/layout.tsx`

**Action:** Import and configure FontAwesome CSS

```typescript
// Add at top of file
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
```

**Verification:** FontAwesome icons render correctly without FOUC (flash of unstyled content)

---

### Task 14: Test migration path

**Action:** Manual test
1. Open browser dev tools
2. Set old storage key: `localStorage.setItem('escape-the-algo-excluded', JSON.stringify([{id:'test123',reason:'offered',timestamp:Date.now()}]))`
3. Refresh page
4. Open history panel
5. Verify "test123" entry appears (with "Unknown title" since it's migrated)
6. Verify old key is removed: `localStorage.getItem('escape-the-algo-excluded')` returns null

**Verification:** Migration works correctly

---

### Task 15: Build and lint check

**Action:** Run build to catch any issues

```bash
npm run build
npm run lint
```

**Verification:** Build succeeds with no errors

---

### Task 16: Commit and push

**Action:** Commit all changes

```bash
git add -A
git commit -m "Add video history panel with storage migration

- Replace 'Show me another' button with icon control bar (FontAwesome)
- Add slide-out history panel showing past videos
- Migrate storage from 'excluded' to 'history' format
- Store full video metadata (title, channel, channelId)
- Links open videos/channels in new tabs"
git push -u origin claude/show-history-01DPDr7qEk7tngrjPvRwnNm8
```

**Verification:** Push succeeds

---

## Summary

| Category | Files |
|----------|-------|
| **New files** | `ControlBar.tsx`, `ControlBar.module.css`, `HistoryPanel.tsx`, `HistoryPanel.module.css` |
| **Modified** | `types/index.ts`, `storage.ts`, `page.tsx`, `layout.tsx`, `youtube-search/route.ts`, `package.json` |
| **Dependencies** | `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/react-fontawesome` |

**Total tasks:** 16
