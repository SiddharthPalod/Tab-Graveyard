/**
 * src/core/telemetry.ts — RPG Level Progression & Telemetry Tracker.
 * Pure data layer. Zero JSX. Zero UI imports.
 */

export interface TelemetryStats {
  tabsPurged:        number;
  tabsRevived:       number;
  tabsSwept:         number;
  tombstonesCreated: number;
}

export interface LevelInfo {
  level:      number;
  title:      string;
  currentXp:  number;
  nextLevelXp: number;
  progress:   number; // 0 to 100%
}

const STORAGE_KEY = 'graveyard_telemetry_stats';

const LEVEL_THRESHOLDS = [
  { level: 1,  xp: 0,    title: 'Gravedigger' },
  { level: 2,  xp: 25,   title: 'Gravekeeper' },
  { level: 3,  xp: 60,   title: 'Caretaker' },
  { level: 4,  xp: 110,  title: 'Keeper' },
  { level: 5,  xp: 180,  title: 'Warden' },
  { level: 6,  xp: 280,  title: 'Soulkeeper' },
  { level: 7,  xp: 420,  title: 'Bonekeeper' },
  { level: 8,  xp: 600,  title: 'Crypt Lord' },
  { level: 9,  xp: 850,  title: 'Grave Lord' },
  { level: 10, xp: 1200, title: 'Death Lord' },
  { level: 11, xp: 1700, title: 'Grave Master' },
  { level: 12, xp: 2400, title: 'Gravekeeper' },
  { level: 13, xp: 3400, title: 'Soul Master' },
  { level: 14, xp: 4800, title: 'Death Master' },
  { level: 15, xp: 7000, title: 'Grave King' },
];

export function computeLevelInfo(stats: TelemetryStats, currentBuried: number = 0): LevelInfo {
  // Compute total XP
  const xp = 
    (stats.tabsPurged * 12) +
    (stats.tabsRevived * 20) +
    (stats.tabsSwept * 8) +
    (stats.tombstonesCreated * 25) +
    (currentBuried * 3);

  let currentRank = LEVEL_THRESHOLDS[0];
  let nextRank    = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentRank = LEVEL_THRESHOLDS[i];
      nextRank    = LEVEL_THRESHOLDS[i + 1] || { level: currentRank.level + 1, xp: currentRank.xp + 300, title: 'Death Sovereign+' };
      break;
    }
  }

  const range = Math.max(1, nextRank.xp - currentRank.xp);
  const earnedInRange = Math.max(0, xp - currentRank.xp);
  const progress = Math.min(100, Math.round((earnedInRange / range) * 100));

  return {
    level:       currentRank.level,
    title:       currentRank.title,
    currentXp:   xp,
    nextLevelXp: nextRank.xp,
    progress,
  };
}

export async function loadTelemetry(): Promise<TelemetryStats> {
  const fallback: TelemetryStats = {
    tabsPurged:        0,
    tabsRevived:       0,
    tabsSwept:         0,
    tombstonesCreated: 0,
  };

  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return fallback;
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (res) => {
      if (res && res[STORAGE_KEY]) {
        resolve({ ...fallback, ...res[STORAGE_KEY] });
      } else {
        resolve(fallback);
      }
    });
  });
}

export async function recordTelemetryEvent(
  event: 'purge' | 'revive' | 'sweep' | 'tombstone',
  count: number = 1
): Promise<TelemetryStats> {
  const stats = await loadTelemetry();
  if (event === 'purge') stats.tabsPurged += count;
  if (event === 'revive') stats.tabsRevived += count;
  if (event === 'sweep') stats.tabsSwept += count;
  if (event === 'tombstone') stats.tombstonesCreated += count;

  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: stats });
  }

  return stats;
}
