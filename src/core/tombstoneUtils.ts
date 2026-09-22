/**
 * src/core/tombstoneUtils.ts
 * Pure helpers for Tombstone naming and grouping. Zero React. Fully testable.
 */
import type { TombstoneTabItem } from './db';

/**
 * Generates an Undertale-style or descriptive title for a tombstone bundle
 * based on the constituent tabs' domains.
 *
 * Examples:
 *   - All github.com -> "github.com Rabbit Hole (5 URLs)"
 *   - Two top domains -> "github.com & stackoverflow.com (4 URLs)"
 *   - Diverse -> "Underground Research (7 URLs)"
 */
export function generateTombstoneTitle(tabs: TombstoneTabItem[]): string {
  if (!tabs || tabs.length === 0) return 'Empty Tombstone';

  // Count domain frequencies
  const domainCounts: Record<string, number> = {};
  for (const tab of tabs) {
    const d = tab.domain || 'web';
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  }

  const sortedDomains = Object.keys(domainCounts).sort(
    (a, b) => domainCounts[b] - domainCounts[a],
  );

  const total = tabs.length;
  const unit = total === 1 ? 'URL' : 'URLs';

  if (sortedDomains.length === 1) {
    return `${sortedDomains[0]} Rabbit Hole (${total} ${unit})`;
  }

  if (sortedDomains.length === 2) {
    return `${sortedDomains[0]} & ${sortedDomains[1]} (${total} ${unit})`;
  }

  const topDomain = sortedDomains[0];
  const topCount = domainCounts[topDomain];

  // If top domain represents 50%+ of tabs
  if (topCount >= Math.ceil(total / 2)) {
    return `${topDomain} & Others (${total} ${unit})`;
  }

  return `Underground Research (${total} ${unit})`;
}
