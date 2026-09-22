import { describe, it, expect } from 'vitest';
import { groupTabsIntoTemporalSessions } from '../core/sessionUtils';
import type { TabRecord } from '../core/db';

const makeTab = (url: string, lastActivatedAt: number, overrides: Partial<TabRecord> = {}): TabRecord => ({
  cleanUrl:        url,
  url,
  title:           url,
  domain:          'example.com',
  status:          'dead',
  openedAt:        lastActivatedAt - 1000,
  lastActivatedAt,
  totalActiveTime: 5000,
  activationCount: 1,
  ...overrides,
});

describe('groupTabsIntoTemporalSessions', () => {
  it('returns empty array when no dead tabs', () => {
    expect(groupTabsIntoTemporalSessions([])).toEqual([]);
  });

  it('does not group single isolated tabs (requires >= 2 tabs)', () => {
    const tabs = [
      makeTab('https://a.com', 1_000_000),
      makeTab('https://b.com', 2_000_000), // hours apart
    ];
    expect(groupTabsIntoTemporalSessions(tabs, 15 * 60 * 1000)).toHaveLength(0);
  });

  it('groups tabs closed within 15 minutes of each other', () => {
    const base = 1_000_000;
    const tabs = [
      makeTab('https://a.com', base),
      makeTab('https://b.com', base + 2 * 60 * 1000), // 2 mins later
      makeTab('https://c.com', base + 5 * 60 * 1000), // 5 mins later
      makeTab('https://d.com', base + 4 * 60 * 60 * 1000), // 4 hours later (isolated)
    ];

    const sessions = groupTabsIntoTemporalSessions(tabs, 15 * 60 * 1000);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tabs).toHaveLength(3);
    expect(sessions[0].tabs.map((t) => t.cleanUrl)).toContain('https://a.com');
    expect(sessions[0].tabs.map((t) => t.cleanUrl)).toContain('https://b.com');
    expect(sessions[0].tabs.map((t) => t.cleanUrl)).toContain('https://c.com');
  });

  it('groups explicit sessionId tabs regardless of timestamp spread', () => {
    const tabs = [
      makeTab('https://a.com', 100, { sessionId: 'window_xyz' }),
      makeTab('https://b.com', 500_000, { sessionId: 'window_xyz' }),
    ];

    const sessions = groupTabsIntoTemporalSessions(tabs);
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe('window_xyz');
    expect(sessions[0].tabs).toHaveLength(2);
  });
});
