/**
 * src/core/behavior.ts
 * The Behavioral Mirror — passive zero-input tab profiling and metamorphosis engine.
 * JS devs own this file. Zero React. Zero UI. Fully testable.
 */
import type { TabRecord } from './db';

export type TabArchetype =
  | 'phantom'
  | 'zombie'
  | 'artifact'
  | 'mayfly'
  | 'grimoire'
  | 'abyss'
  | 'hoard'
  | 'spark';

export interface ArchetypeMeta {
  id:          TabArchetype;
  icon:        string;
  name:        string;
  quote:       string;
  description: string;
  badgeCls:    string;
}

export interface Metamorphosis {
  type:     'awakened' | 'materialized' | 'studied' | 'petrified' | 'consumed' | 'degraded';
  icon:     string;
  title:    string;
  flavor:   string;
  badgeCls: string;
}

export const ARCHETYPE_META: Record<TabArchetype, ArchetypeMeta> = {
  phantom: {
    id:          'phantom',
    icon:        '👻',
    name:        'PHANTOM',
    quote:       '* Opened with noble intentions. Instantly forgotten.',
    description: 'Viewed < 15s total. You just wanted to save the link.',
    badgeCls:    'text-zinc-400 border-zinc-500',
  },
  zombie: {
    id:          'zombie',
    icon:        '🧟',
    name:        'ZOMBIE',
    quote:       '* Clicked out of pure reflex just to verify it is still alive.',
    description: 'Visited 3+ times, but < 10s per visit. Never actually read.',
    badgeCls:    'text-green-400 border-green-500',
  },
  artifact: {
    id:          'artifact',
    icon:        '🏺',
    name:        'ARTIFACT',
    quote:       '* A monument to a quest completed long ago. Let it rest.',
    description: 'Spent 20+ mins here in the past, but untouched for 3+ days.',
    badgeCls:    'text-amber-400 border-amber-500',
  },
  mayfly: {
    id:          'mayfly',
    icon:        '⏳',
    name:        'MAYFLY',
    quote:       '* Born for a single fleeting inquiry. It served you well.',
    description: 'Search results or auth redirect, single visit, idle for hours.',
    badgeCls:    'text-cyan-400 border-cyan-500',
  },
  grimoire: {
    id:          'grimoire',
    icon:        '📜',
    name:        'GRIMOIRE',
    quote:       '* Consulted in times of dire errors, then left open forever.',
    description: 'Documentation or developer references kept as safety blankets.',
    badgeCls:    'text-ut-lv border-ut-lv',
  },
  abyss: {
    id:          'abyss',
    icon:        '🕳️',
    name:        'ABYSS',
    quote:       '* A dark vortex that consumed your afternoon DETERMINATION.',
    description: 'Endless feeds and video streams with heavy engagement.',
    badgeCls:    'text-ut-soul border-ut-soul',
  },
  hoard: {
    id:          'hoard',
    icon:        '🛒',
    name:        'HOARD',
    quote:       '* Items waiting for a discount that will never arrive.',
    description: 'Shopping carts and price comparisons dormant for days.',
    badgeCls:    'text-ut-orange border-ut-orange',
  },
  spark: {
    id:          'spark',
    icon:        '⚡',
    name:        'SPARK',
    quote:       '* Burning bright with genuine current DETERMINATION.',
    description: 'Active workhorse currently being read or edited.',
    badgeCls:    'text-yellow-300 border-yellow-400',
  },
};

const SOCIAL_FEED_PATTERNS = [
  'youtube.com', 'youtu.be', 'reddit.com', 'twitter.com', 'x.com',
  'instagram.com', 'tiktok.com', 'facebook.com', 'twitch.tv', 'news.ycombinator.com',
];

const DEV_DOCS_PATTERNS = [
  'github.com', 'stackoverflow.com', 'stackexchange.com', 'developer.mozilla.org',
  'npmjs.com', 'docs.', 'godoc.org', 'pypi.org', 'crates.io', 'react.dev',
  'vuejs.org', 'angular.io', 'learn.microsoft.com', 'devdocs.io',
];

const SHOPPING_PATTERNS = [
  'amazon.', 'ebay.', 'aliexpress.', 'walmart.', 'etsy.', 'flipkart.', 'bestbuy.', 'newegg.',
];

/**
 * Classifies a tab into one of the 8 behavioral archetypes based on
 * pure telemetry: totalActiveTime, activationCount, domain, and inactivity.
 */
export function classifyTabBehavior(
  tab: Pick<TabRecord, 'url' | 'domain' | 'totalActiveTime' | 'activationCount' | 'lastActivatedAt'>,
  now: number = Date.now(),
): TabArchetype {
  const urlLower    = (tab.url || '').toLowerCase();
  const domainLower = (tab.domain || '').toLowerCase();
  const inactiveMs  = Math.max(0, now - tab.lastActivatedAt);
  const activeTime  = tab.totalActiveTime || 0;
  const visits      = tab.activationCount || 1;
  const avgPerVisit = visits > 0 ? activeTime / visits : 0;

  // 1. Mayfly: One-off search queries, auth redirects, speed tests
  const isSearchOrAuth =
    urlLower.includes('/search?') ||
    urlLower.includes('google.com/search') ||
    urlLower.includes('bing.com/search') ||
    urlLower.includes('duckduckgo.com/?q=') ||
    urlLower.includes('/login') ||
    urlLower.includes('/signin') ||
    urlLower.includes('/oauth') ||
    urlLower.includes('accounts.google.com');

  if (isSearchOrAuth && visits <= 2 && activeTime < 45_000) {
    return 'mayfly';
  }

  // 2. Abyss: Endless feeds and video streams
  const isSocial = SOCIAL_FEED_PATTERNS.some((p) => domainLower.includes(p));
  if (isSocial && (activeTime >= 60_000 || visits >= 4)) {
    return 'abyss';
  }

  // 3. Grimoire: Developer documentation and reference material
  const isDevDoc = DEV_DOCS_PATTERNS.some((p) => domainLower.includes(p) || urlLower.includes(p));
  if (isDevDoc && activeTime >= 20_000) {
    return 'grimoire';
  }

  // 4. Hoard: E-commerce shopping and price comparison tabs
  const isShop = SHOPPING_PATTERNS.some((p) => domainLower.includes(p));
  if (isShop && inactiveMs >= 24 * 60 * 60 * 1000) {
    return 'hoard';
  }

  // 5. Artifact: High historical focus (> 20 mins), but abandoned for 3+ days
  if (activeTime >= 20 * 60 * 1000 && inactiveMs >= 3 * 24 * 60 * 60 * 1000) {
    return 'artifact';
  }

  // 🌟 Awakening rule: If recently active (< 15 mins) with substantial focus (>= 45s),
  // it breaks out of Zombie or Phantom slumber and promotes to a living Spark!
  if (inactiveMs < 15 * 60 * 1000 && activeTime >= 45_000) {
    return 'spark';
  }

  // 6. Zombie: Frequently clicked, but superficial attention (< 10s per visit)
  if (visits >= 3 && avgPerVisit < 10_000) {
    return 'zombie';
  }

  // 7. Phantom: Opened in background, barely looked at (< 15s total, <= 2 visits)
  if (activeTime < 15_000 && visits <= 2) {
    return 'phantom';
  }

  // 8. Spark: Active workhorse
  return 'spark';
}

/**
 * Returns metamorphosis details when a tab transitions from one archetype to another.
 */
export function getMetamorphosis(prev?: string, current?: string): Metamorphosis | null {
  if (!prev || !current || prev === current) return null;

  if (prev === 'zombie' && current === 'spark') {
    return {
      type:     'awakened',
      icon:     '🌟',
      title:    'AWAKENED',
      flavor:   '* A Zombie broke its curse through sustained focus!',
      badgeCls: 'text-yellow-300 border-yellow-400 bg-yellow-950/40',
    };
  }

  if (prev === 'phantom' && current === 'spark') {
    return {
      type:     'materialized',
      icon:     '✨',
      title:    'MATERIALIZED',
      flavor:   '* A Phantom link gained physical substance and purpose.',
      badgeCls: 'text-cyan-300 border-cyan-400 bg-cyan-950/40',
    };
  }

  if (prev === 'phantom' && current === 'grimoire') {
    return {
      type:     'studied',
      icon:     '📖',
      title:    'STUDIED',
      flavor:   '* A forgotten link was unlocked as valuable lore.',
      badgeCls: 'text-amber-300 border-amber-400 bg-amber-950/40',
    };
  }

  if (prev === 'spark' && current === 'artifact') {
    return {
      type:     'petrified',
      icon:     '🗿',
      title:    'PETRIFIED',
      flavor:   '* An active quest cooled down into a stone monument.',
      badgeCls: 'text-zinc-400 border-zinc-500 bg-zinc-900',
    };
  }

  if (current === 'abyss') {
    return {
      type:     'consumed',
      icon:     '🌀',
      title:    'CONSUMED',
      flavor:   '* Pulled into an endless underground whirlpool.',
      badgeCls: 'text-red-400 border-red-500 bg-red-950/40',
    };
  }

  if (prev === 'spark' && current === 'zombie') {
    return {
      type:     'degraded',
      icon:     '🧟',
      title:    'DEGRADED',
      flavor:   '* Focus faded into mindless repetitive checking.',
      badgeCls: 'text-green-400 border-green-500 bg-green-950/40',
    };
  }

  return null;
}
