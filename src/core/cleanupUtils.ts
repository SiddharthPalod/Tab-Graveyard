/**
 * src/core/cleanupUtils.ts
 * Pure helpers for graveyard retention and cremation.
 */
import type { TabRecord } from './db';

/**
 * Splits dead tabs into preserved (newest N) and cremated (older beyond N).
 * deadTabs are assumed or sorted by lastActivatedAt descending (newest first).
 */
export function partitionForCremation<T extends { lastActivatedAt: number }>(
  tabs: T[],
  keepCount: number = 20,
): { preserved: T[]; cremated: T[] } {
  const safeKeep = Math.max(0, Math.floor(keepCount));
  const sorted = [...tabs].sort((a, b) => b.lastActivatedAt - a.lastActivatedAt);

  const preserved = sorted.slice(0, safeKeep);
  const cremated = sorted.slice(safeKeep);

  return { preserved, cremated };
}
