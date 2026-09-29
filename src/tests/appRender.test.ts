// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { App } from '../App';
import { GraveyardPage } from '../ui/pages/GraveyardPage';
import { LivingPage } from '../ui/pages/LivingPage';
import { CatacombsPage } from '../ui/pages/CatacombsPage';
import { TabViewModel } from '../core/behavior';
import { TopicCluster, GraveyardLocalStats } from '../core/topicUtils';

const mockTab: TabViewModel = {
  cleanUrl: 'https://example.com/test',
  url: 'https://example.com/test',
  title: 'Test Tab Title',
  domain: 'example.com',
  status: 'dead',
  openedAt: Date.now() - 10000,
  lastActivatedAt: Date.now() - 5000,
  totalActiveTime: 12000,
  activationCount: 4,
  daysInactive: 1,
  archetype: 'zombie',
  metamorphosis: {
    status: 'zombie',
    title: 'ZOMBIE',
    flavor: 'Test flavor',
    badgeCls: 'test-badge',
    icon: '🧟',
  },
};

const mockTopic: TopicCluster = {
  id: 'topic_test',
  name: 'Test Topic',
  icon: '💻',
  keywords: ['test', 'topic'],
  tabs: [mockTab],
  count: 1,
  totalActiveTime: 12000,
};

const mockStats: GraveyardLocalStats = {
  totalBuried: 1,
  totalActiveTime: 12000,
  topDomain: 'example.com',
  topTopic: 'Test Topic',
  avgDormancyDays: 2,
};

const mockActions: any = {
  revive: () => Promise.resolve(),
  purge: () => Promise.resolve(),
  sweep: () => Promise.resolve(),
  resurrectAll: () => Promise.resolve(),
  simulateAging: () => Promise.resolve(),
  collapseToTombstone: () => Promise.resolve(),
  resurrectTombstone: () => Promise.resolve(),
  shatterTombstone: () => Promise.resolve(),
  reviveTombstoneUrl: () => Promise.resolve(),
  bundleGravesToTombstone: () => Promise.resolve(),
  cremateOldest: () => Promise.resolve(0),
  sweepByArchetype: () => Promise.resolve(),
  collapseArchetypeToTombstone: () => Promise.resolve(),
  collapseTopicToTombstone: () => Promise.resolve(),
  resurrectSession: () => Promise.resolve(),
  purgeSession: () => Promise.resolve(),
  convertSessionToTombstone: () => Promise.resolve(),
  purgeSelected: () => Promise.resolve(),
  refresh: () => Promise.resolve(),
  setFilter: () => {},
  resetFilters: () => {},
  setKeepCount: () => {},
};

describe('UI Pages Deep Render Tests (Regression Suite)', () => {
  it('renders GraveyardPage with loaded data and topics without throwing', () => {
    expect(() => {
      const html = renderToString(
        React.createElement(GraveyardPage, {
          tabs: [mockTab],
          searchQuery: '',
          loading: false,
          hoveredUrl: null,
          onHover: () => {},
          keepCount: 20,
          cremateCount: 0,
          totalDead: 1,
          topics: [mockTopic],
          stats: mockStats,
          actions: mockActions,
        })
      );
      expect(html).toContain('Test Tab Title');
      expect(html).toContain('FORGOTTEN INTERESTS');
    }).not.toThrow();
  });

  it('renders LivingPage without throwing', () => {
    expect(() => {
      const html = renderToString(
        React.createElement(LivingPage, {
          tabs: [{ ...mockTab, status: 'alive' }],
          archetypes: {
            phantom: [],
            zombie: [{ ...mockTab, status: 'alive' }],
            artifact: [],
            mayfly: [],
            grimoire: [],
            abyss: [],
            hoard: [],
            spark: [],
          },
          searchQuery: '',
          loading: false,
          hoveredUrl: null,
          onHover: () => {},
          actions: mockActions,
        })
      );
      expect(html).toContain('Test Tab Title');
    }).not.toThrow();
  });

  it('renders CatacombsPage without throwing', () => {
    expect(() => {
      const html = renderToString(
        React.createElement(CatacombsPage, {
          tombstones: [
            {
              id: 'tomb_1',
              title: 'Test Tombstone',
              createdAt: Date.now(),
              tabs: [{ cleanUrl: mockTab.cleanUrl, url: mockTab.url, title: mockTab.title, domain: mockTab.domain }],
            },
          ],
          temporalSessions: [],
          searchQuery: '',
          loading: false,
          actions: mockActions,
        })
      );
      expect(html).toContain('Test Tombstone');
    }).not.toThrow();
  });

  it('renders CatacombsPage with temporal sessions showing RESURRECT and PURGE', () => {
    const html = renderToString(
      React.createElement(CatacombsPage, {
        tombstones: [],
        temporalSessions: [
          {
            id: 'sess_1',
            title: 'Late Night Research',
            timestamp: Date.now() - 3600000,
            tabs: [mockTab],
          },
        ],
        searchQuery: '',
        loading: false,
        actions: mockActions,
      })
    );
    expect(html).toContain('Late Night Research');
    expect(html).toContain('RESURRECT');
    expect(html).toContain('PURGE');
  });

  it('renders full App with chrome mock without throwing', () => {
    (globalThis as any).chrome = {
      storage: {
        local: {
          get: (_keys: any, cb: any) => cb({}),
          set: () => {},
        },
      },
      tabs: {
        query: () => Promise.resolve([]),
        create: () => Promise.resolve({ id: 1 }),
        remove: () => Promise.resolve(),
        onRemoved: { addListener: () => {}, removeListener: () => {} },
        onCreated: { addListener: () => {}, removeListener: () => {} },
        onUpdated: { addListener: () => {}, removeListener: () => {} },
      },
      runtime: {
        sendMessage: () => {},
      },
    };

    expect(() => {
      const html = renderToString(React.createElement(App));
      expect(html).toBeDefined();
    }).not.toThrow();
  });
});
