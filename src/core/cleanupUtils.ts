/**
 * src/core/cleanupUtils.ts
 * Pure helpers for graveyard retention and cremation.
 */

/**
 * Splits dead tabs into preserved (newest N) and cremated (older beyond N).
 * Excludes any tabs whose cleanUrl is in `protectedUrls` (e.g. tabs in Temporal Sessions).
 */
export function partitionForCremation<T extends { lastActivatedAt: number; cleanUrl?: string }>(
  tabs: T[],
  keepCount: number = 20,
  protectedUrls: string[] = [],
): { preserved: T[]; cremated: T[] } {
  const safeKeep = Math.max(0, Math.floor(keepCount));
  const protectedSet = new Set(protectedUrls);

  const eligible = tabs.filter((t) => !t.cleanUrl || !protectedSet.has(t.cleanUrl));
  const sorted = [...eligible].sort((a, b) => b.lastActivatedAt - a.lastActivatedAt);

  const preserved = sorted.slice(0, safeKeep);
  const cremated = sorted.slice(safeKeep);

  return { preserved, cremated };
}
