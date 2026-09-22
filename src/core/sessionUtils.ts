/**
 * src/core/sessionUtils.ts
 * Temporal Sessions clustering — groups tabs closed around the same time window
 * or sharing a sessionId into deterministic past workspace sessions.
 * Pure TS. Zero React. Fully testable.
 */
import type { TabRecord } from './db';
import { generateTombstoneTitle } from './tombstoneUtils';

export interface TemporalSession {
  id:        string;
  title:     string;
  timestamp: number;
  tabs:      TabRecord[];
}

/**
 * Clusters dead tabs into temporal sessions.
 * Tabs closed within `windowMs` (default 15 minutes) of each other with >= 2 tabs
 * form a recognizable Temporal Session (e.g. mass browser close or research sprint).
 */
export function groupTabsIntoTemporalSessions(
  deadTabs: TabRecord[],
  windowMs: number = 15 * 60 * 1000,
): TemporalSession[] {
  if (!deadTabs || deadTabs.length === 0) return [];

  // Group by explicit sessionId first if available
  const explicitSessions: Record<string, TabRecord[]> = {};
  const remainingTabs: TabRecord[] = [];

  for (const tab of deadTabs) {
    if (tab.sessionId) {
      if (!explicitSessions[tab.sessionId]) explicitSessions[tab.sessionId] = [];
      explicitSessions[tab.sessionId].push(tab);
    } else {
      remainingTabs.push(tab);
    }
  }

  const result: TemporalSession[] = [];

  // Add explicit sessions (>= 2 tabs)
  for (const [sId, tabs] of Object.entries(explicitSessions)) {
    if (tabs.length >= 2) {
      const latestTime = Math.max(...tabs.map((t) => t.lastActivatedAt));
      const autoTitle  = generateTombstoneTitle(tabs);
      result.push({
        id:        sId,
        title:     `Session: ${autoTitle}`,
        timestamp: latestTime,
        tabs,
      });
    }
  }

  // Sort remaining tabs descending by lastActivatedAt
  remainingTabs.sort((a, b) => b.lastActivatedAt - a.lastActivatedAt);

  let currentCluster: TabRecord[] = [];

  for (const tab of remainingTabs) {
    if (currentCluster.length === 0) {
      currentCluster.push(tab);
    } else {
      const prev = currentCluster[currentCluster.length - 1];
      const diff = Math.abs(prev.lastActivatedAt - tab.lastActivatedAt);

      if (diff <= windowMs) {
        currentCluster.push(tab);
      } else {
        if (currentCluster.length >= 2) {
          const latestTime = currentCluster[0].lastActivatedAt;
          const autoTitle  = generateTombstoneTitle(currentCluster);
          result.push({
            id:        `session_${latestTime}`,
            title:     `Temporal Session (${currentCluster.length} URLs): ${autoTitle}`,
            timestamp: latestTime,
            tabs:      [...currentCluster],
          });
        }
        currentCluster = [tab];
      }
    }
  }

  // Flush last cluster
  if (currentCluster.length >= 2) {
    const latestTime = currentCluster[0].lastActivatedAt;
    const autoTitle  = generateTombstoneTitle(currentCluster);
    result.push({
      id:        `session_${latestTime}`,
      title:     `Temporal Session (${currentCluster.length} URLs): ${autoTitle}`,
      timestamp: latestTime,
      tabs:      [...currentCluster],
    });
  }

  return result.sort((a, b) => b.timestamp - a.timestamp);
}
