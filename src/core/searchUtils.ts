/**
 * src/core/searchUtils.ts
 * Advanced Search, Multi-Filter, and Sorting Engine.
 * Pure TS. Zero React. Fully testable.
 */
import type { TabRecord, TombstoneRecord } from './db';
import { classifyTabBehavior, TabArchetype } from './behavior';
import type { TemporalSession } from './sessionUtils';

export type SortOption = 'recent' | 'visits' | 'duration';

export interface FilterOptions {
  query?:      string;
  domain?:     string;
  archetype?:  TabArchetype;
  minAgeDays?: number;
  sortBy?:     SortOption;
}

export interface DomainCount {
  domain: string;
  count:  number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Filters and sorts tab records based on multiple dimensions:
 * text query, domain, behavioral archetype, minimum age, and sort criteria.
 * Generic over TabRecord to preserve TabViewModel metadata.
 */
export function filterAndSortTabs<T extends TabRecord>(
  tabs: T[],
  options: FilterOptions,
  now: number = Date.now(),
): T[] {
  if (!tabs || tabs.length === 0) return [];

  const q = (options.query || '').toLowerCase().trim();
  const domainFilter = (options.domain || '').toLowerCase().trim();
  const archetypeFilter = options.archetype;
  const minAgeMs = options.minAgeDays ? options.minAgeDays * DAY_MS : 0;
  const sortBy = options.sortBy || 'recent';

  const filtered = tabs.filter((tab) => {
    // 1. Text Query Filter
    if (q) {
      const matchTitle = (tab.title || '').toLowerCase().includes(q);
      const matchUrl   = (tab.url || '').toLowerCase().includes(q);
      const matchClean = (tab.cleanUrl || '').toLowerCase().includes(q);
      const matchDom   = (tab.domain || '').toLowerCase().includes(q);
      if (!matchTitle && !matchUrl && !matchClean && !matchDom) return false;
    }

    // 2. Domain Filter
    if (domainFilter) {
      if ((tab.domain || '').toLowerCase() !== domainFilter) return false;
    }

    // 3. Behavioral Archetype Filter
    if (archetypeFilter) {
      // Use existing tab.archetype if already attached, else classify
      const arch = (tab as any).archetype || classifyTabBehavior(tab, now);
      if (arch !== archetypeFilter) return false;
    }

    // 4. Minimum Inactivity Age Filter
    if (minAgeMs > 0) {
      const inactive = now - tab.lastActivatedAt;
      if (inactive < minAgeMs) return false;
    }

    return true;
  });

  // 5. Sorting
  return filtered.sort((a, b) => {
    if (sortBy === 'visits') {
      return (b.activationCount || 0) - (a.activationCount || 0);
    }
    if (sortBy === 'duration') {
      return (b.totalActiveTime || 0) - (a.totalActiveTime || 0);
    }
    // Default 'recent'
    return b.lastActivatedAt - a.lastActivatedAt;
  });
}

/**
 * Extracts the most frequent domains from a list of tabs.
 */
export function extractTopDomains(tabs: TabRecord[], limit: number = 6): DomainCount[] {
  if (!tabs || tabs.length === 0) return [];

  const counts: Record<string, number> = {};
  for (const tab of tabs) {
    const d = (tab.domain || 'other').toLowerCase();
    counts[d] = (counts[d] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Filters tombstone monuments by query string and domain.
 * Pure business logic for Catacombs search.
 */
export function filterTombstones(
  tombstones: TombstoneRecord[],
  query?: string,
  domain?: string,
): TombstoneRecord[] {
  if (!tombstones || tombstones.length === 0) return [];
  const q = (query || '').toLowerCase().trim();
  const d = (domain || '').toLowerCase().trim();

  if (!q && !d) return tombstones;

  return tombstones.filter((tomb) => {
    if (q) {
      const matchTitle = (tomb.title || '').toLowerCase().includes(q);
      const matchTab = tomb.tabs.some(
        (tab) =>
          (tab.title || '').toLowerCase().includes(q) ||
          (tab.domain || '').toLowerCase().includes(q) ||
          (tab.url || '').toLowerCase().includes(q),
      );
      if (!matchTitle && !matchTab) return false;
    }
    if (d) {
      const matchDomain = tomb.tabs.some(
        (tab) => (tab.domain || '').toLowerCase() === d,
      );
      if (!matchDomain) return false;
    }
    return true;
  });
}

/**
 * Filters temporal sessions by query string and domain.
 * Pure business logic for temporal sessions.
 */
export function filterTemporalSessions(
  sessions: TemporalSession[],
  query?: string,
  domain?: string,
): TemporalSession[] {
  if (!sessions || sessions.length === 0) return [];
  const q = (query || '').toLowerCase().trim();
  const d = (domain || '').toLowerCase().trim();

  if (!q && !d) return sessions;

  return sessions.filter((sess) => {
    if (q) {
      const matchTitle = (sess.title || '').toLowerCase().includes(q);
      const matchTab = sess.tabs.some(
        (tab) =>
          (tab.title || '').toLowerCase().includes(q) ||
          (tab.domain || '').toLowerCase().includes(q) ||
          (tab.url || '').toLowerCase().includes(q),
      );
      if (!matchTitle && !matchTab) return false;
    }
    if (d) {
      const matchDomain = sess.tabs.some(
        (tab) => (tab.domain || '').toLowerCase() === d,
      );
      if (!matchDomain) return false;
    }
    return true;
  });
}
