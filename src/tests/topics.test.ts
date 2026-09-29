import { describe, it, expect } from 'vitest';
import {
  extractKeywords,
  extractBigrams,
  clusterTabsByTopics,
  computeGraveyardStats,
} from '../core/topicUtils';
import { TabRecord } from '../core/db';

describe('topicUtils — Phase 8 Graveyard Topics & Local Statistics', () => {
  it('extracts keywords while filtering out stop words and web noise', () => {
    const title = 'Building a Database: Raft Implementation in Go | GitHub';
    const keywords = extractKeywords(title);

    expect(keywords).toContain('building');
    expect(keywords).toContain('database');
    expect(keywords).toContain('raft');
    expect(keywords).toContain('implementation');
    // Stop words like 'a', 'in', and noise like 'github' should be removed
    expect(keywords).not.toContain('a');
    expect(keywords).not.toContain('in');
    expect(keywords).not.toContain('github');
  });

  it('extracts bigrams for compound terms', () => {
    const tokens = ['distributed', 'systems', 'consensus', 'algorithm'];
    const bigrams = extractBigrams(tokens);

    expect(bigrams).toEqual([
      'distributed systems',
      'systems consensus',
      'consensus algorithm',
    ]);
  });

  it('clusters tabs with shared keywords into automatic topic folders', () => {
    const tabs: TabRecord[] = [
      {
        cleanUrl: 'raft-1',
        url: 'https://example.com/raft-implementation',
        title: 'Raft implementation in Rust',
        domain: 'example.com',
        status: 'dead',
        openedAt: 1000,
        lastActivatedAt: 2000,
        totalActiveTime: 5000,
        activationCount: 2,
      },
      {
        cleanUrl: 'raft-2',
        url: 'https://example.com/raft-consensus-paper',
        title: 'Raft consensus paper overview',
        domain: 'example.com',
        status: 'dead',
        openedAt: 1000,
        lastActivatedAt: 2000,
        totalActiveTime: 3000,
        activationCount: 1,
      },
      {
        cleanUrl: 'etcd-1',
        url: 'https://example.com/etcd-raft',
        title: 'Etcd raft distributed consensus',
        domain: 'example.com',
        status: 'dead',
        openedAt: 1000,
        lastActivatedAt: 2000,
        totalActiveTime: 4000,
        activationCount: 3,
      },
      {
        cleanUrl: 'react-1',
        url: 'https://react.dev/hooks',
        title: 'React Hooks Documentation',
        domain: 'react.dev',
        status: 'dead',
        openedAt: 1000,
        lastActivatedAt: 2000,
        totalActiveTime: 1000,
        activationCount: 1,
      },
      {
        cleanUrl: 'react-2',
        url: 'https://react.dev/components',
        title: 'React Components and Props',
        domain: 'react.dev',
        status: 'dead',
        openedAt: 1000,
        lastActivatedAt: 2000,
        totalActiveTime: 2000,
        activationCount: 2,
      },
    ];

    const clusters = clusterTabsByTopics(tabs, 2);

    expect(clusters.length).toBeGreaterThanOrEqual(2);

    // Look for Raft / Consensus topic cluster
    const raftCluster = clusters.find((c) => c.name.toLowerCase().includes('raft'));
    expect(raftCluster).toBeDefined();
    expect(raftCluster?.count).toBe(3);
    expect(raftCluster?.totalActiveTime).toBe(12000);

    // Look for React topic cluster
    const reactCluster = clusters.find((c) => c.name.toLowerCase().includes('react'));
    expect(reactCluster).toBeDefined();
    expect(reactCluster?.count).toBe(2);
  });

  it('computes accurate graveyard local statistics', () => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    const tabs: TabRecord[] = [
      {
        cleanUrl: 'github-1',
        url: 'https://github.com/project-a',
        title: 'Project A Repository',
        domain: 'github.com',
        status: 'dead',
        openedAt: now - 10 * dayMs,
        lastActivatedAt: now - 5 * dayMs,
        totalActiveTime: 60000,
        activationCount: 5,
      },
      {
        cleanUrl: 'github-2',
        url: 'https://github.com/project-b',
        title: 'Project B Repository',
        domain: 'github.com',
        status: 'dead',
        openedAt: now - 12 * dayMs,
        lastActivatedAt: now - 7 * dayMs,
        totalActiveTime: 40000,
        activationCount: 3,
      },
      {
        cleanUrl: 'news-1',
        url: 'https://news.ycombinator.com/item',
        title: 'Hacker News Thread',
        domain: 'news.ycombinator.com',
        status: 'dead',
        openedAt: now - 4 * dayMs,
        lastActivatedAt: now - 2 * dayMs,
        totalActiveTime: 20000,
        activationCount: 1,
      },
    ];

    const clusters = clusterTabsByTopics(tabs, 2);
    const stats = computeGraveyardStats(tabs, clusters);

    expect(stats.totalBuried).toBe(3);
    expect(stats.totalActiveTime).toBe(120000);
    expect(stats.topDomain).toBe('github.com');
    expect(stats.avgDormancyDays).toBeGreaterThanOrEqual(4);
    expect(stats.topTopic).toBeDefined();
  });
});
