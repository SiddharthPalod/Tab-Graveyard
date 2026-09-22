import { describe, it, expect } from 'vitest';
import {
  filterAndSortTabs,
  extractTopDomains,
  filterTombstones,
  filterTemporalSessions,
} from '../core/searchUtils';
import type { TabRecord, TombstoneRecord } from '../core/db';
import type { TemporalSession } from '../core/sessionUtils';

const DAY = 24 * 60 * 60 * 1000;
const now = 1_700_000_000_000;

const makeTab = (url: string, overrides: Partial<TabRecord> = {}): TabRecord => ({
  cleanUrl:        url.toLowerCase(),
  url,
  title:           'Title for ' + url,
  domain:          new URL(url).hostname,
  status:          'alive',
  openedAt:        now - 10 * DAY,
  lastActivatedAt: now - 1 * DAY,
  totalActiveTime: 10_000,
  activationCount: 2,
  ...overrides,
});

describe('filterAndSortTabs', () => {
  const sampleTabs: TabRecord[] = [
    makeTab('https://github.com/facebook/react', {
      title:           'React Hooks Docs',
      activationCount: 15,
      totalActiveTime: 120_000,
      lastActivatedAt: now - 500, // very recent
    }),
    makeTab('https://github.com/microsoft/vscode', {
      title:           'VS Code Issues',
      activationCount: 3,
      totalActiveTime: 50_000,
      lastActivatedAt: now - 10 * DAY,
    }),
    makeTab('https://www.youtube.com/watch?v=abc', {
      title:           'Lo-Fi 8bit Beats',
      activationCount: 1,
      totalActiveTime: 800_000,
      lastActivatedAt: now - 4 * DAY,
    }),
    makeTab('https://www.google.com/search?q=weather', {
      title:           'weather - Google Search',
      activationCount: 1,
      totalActiveTime: 3000,
      lastActivatedAt: now - 35 * DAY, // very old
    }),
  ];

  it('filters by query text across title, url, domain', () => {
    const res = filterAndSortTabs(sampleTabs, { query: 'lo-fi' }, now);
    expect(res).toHaveLength(1);
    expect(res[0].cleanUrl).toContain('youtube.com');
  });

  it('filters by domain', () => {
    const res = filterAndSortTabs(sampleTabs, { domain: 'github.com' }, now);
    expect(res).toHaveLength(2);
  });

  it('filters by archetype', () => {
    // google search with 3s active time is a mayfly
    const res = filterAndSortTabs(sampleTabs, { archetype: 'mayfly' }, now);
    expect(res).toHaveLength(1);
    expect(res[0].cleanUrl).toContain('google.com');
  });

  it('filters by minimum age (inactivity)', () => {
    // older than 7 days
    const res = filterAndSortTabs(sampleTabs, { minAgeDays: 7 }, now);
    expect(res).toHaveLength(2); // vscode (10d) and google (35d)
  });

  it('sorts by most visits', () => {
    const res = filterAndSortTabs(sampleTabs, { sortBy: 'visits' }, now);
    expect(res[0].activationCount).toBe(15); // react
  });

  it('sorts by longest focus duration', () => {
    const res = filterAndSortTabs(sampleTabs, { sortBy: 'duration' }, now);
    expect(res[0].totalActiveTime).toBe(800_000); // youtube
  });

  it('combines multiple filters simultaneously', () => {
    const res = filterAndSortTabs(
      sampleTabs,
      {
        domain:     'github.com',
        minAgeDays: 5,
      },
      now,
    );
    expect(res).toHaveLength(1);
    expect(res[0].cleanUrl).toContain('vscode');
  });
});

describe('extractTopDomains', () => {
  it('tallies and sorts domains properly', () => {
    const tabs = [
      makeTab('https://github.com/1'),
      makeTab('https://github.com/2'),
      makeTab('https://github.com/3'),
      makeTab('https://youtube.com/1'),
      makeTab('https://youtube.com/2'),
      makeTab('https://reddit.com/1'),
    ];

    const top = extractTopDomains(tabs, 2);
    expect(top).toEqual([
      { domain: 'github.com', count: 3 },
      { domain: 'youtube.com', count: 2 },
    ]);
  });
});

describe('filterTombstones and filterTemporalSessions', () => {
  const sampleTombstones: TombstoneRecord[] = [
    {
      id:        'tomb-1',
      title:     'React Docs Bundle',
      createdAt: now - 1000,
      tabs: [
        { cleanUrl: 'react.dev', url: 'https://react.dev', title: 'React', domain: 'react.dev' },
        { cleanUrl: 'github.com/react', url: 'https://github.com/react', title: 'GitHub', domain: 'github.com' },
      ],
    },
    {
      id:        'tomb-2',
      title:     'Music Stream',
      createdAt: now - 2000,
      tabs: [
        { cleanUrl: 'spotify.com', url: 'https://spotify.com', title: 'Spotify', domain: 'spotify.com' },
      ],
    },
  ];

  const sampleSessions: TemporalSession[] = [
    {
      id:        'sess-1',
      title:     'Dev Session',
      timestamp: now - 3000,
      tabs: [
        makeTab('https://github.com/project'),
      ],
    },
    {
      id:        'sess-2',
      title:     'Social Break',
      timestamp: now - 4000,
      tabs: [
        makeTab('https://reddit.com/r/webdev'),
      ],
    },
  ];

  it('filters tombstones by text query', () => {
    const res = filterTombstones(sampleTombstones, 'react');
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('tomb-1');
  });

  it('filters tombstones by domain', () => {
    const res = filterTombstones(sampleTombstones, undefined, 'github.com');
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('tomb-1');
  });

  it('filters temporal sessions by query and domain', () => {
    const byQuery = filterTemporalSessions(sampleSessions, 'reddit');
    expect(byQuery).toHaveLength(1);
    expect(byQuery[0].id).toBe('sess-2');

    const byDomain = filterTemporalSessions(sampleSessions, undefined, 'github.com');
    expect(byDomain).toHaveLength(1);
    expect(byDomain[0].id).toBe('sess-1');
  });
});
