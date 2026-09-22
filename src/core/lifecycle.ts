/**
 * src/core/lifecycle.ts  — Pure business logic. Zero React. Zero UI. Fully testable.
 * JS devs own this file.
 */
import type { TabRecord } from './db';

export const LIFECYCLE_THRESHOLDS = {
  AGING_MS:     3  * 24 * 60 * 60 * 1000, // 3 days
  FORGOTTEN_MS: 14 * 24 * 60 * 60 * 1000, // 14 days
  DEAD_MS:      30 * 24 * 60 * 60 * 1000, // 30 days
} as const;

export type TabStatus = TabRecord['status'];

/**
 * Derives lifecycle status from inactivity duration.
 * Tabs manually buried (status === 'dead') always stay dead.
 *
 * State machine:
 *   alive → aging (3d) → forgotten (14d) → dead (30d)
 */
export function evaluateTabLifecycle(tab: TabRecord, now: number = Date.now()): TabStatus {
  if (tab.status === 'dead') return 'dead';

  const inactive = now - tab.lastActivatedAt;
  if (inactive >= LIFECYCLE_THRESHOLDS.DEAD_MS)      return 'dead';
  if (inactive >= LIFECYCLE_THRESHOLDS.FORGOTTEN_MS) return 'forgotten';
  if (inactive >= LIFECYCLE_THRESHOLDS.AGING_MS)     return 'aging';
  return 'alive';
}

/** "3d ago", "5h ago", "just now" */
export function formatRelativeTime(timestamp: number, now: number = Date.now()): string {
  const diff    = Math.max(0, now - timestamp);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days    > 0) return `${days}d ago`;
  if (hours   > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/** "2h 15m", "45m", "30s" */
export function formatActiveDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);

  if (hours   > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
