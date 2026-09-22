import { describe, it, expect } from 'vitest';
import { classifyTabBehavior, ARCHETYPE_META, getMetamorphosis } from '../core/behavior';

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

describe('classifyTabBehavior', () => {
  const now = Date.now();

  it('classifies a search query with low duration as mayfly', () => {
    const tab = {
      url:             'https://www.google.com/search?q=weather+today',
      domain:          'www.google.com',
      totalActiveTime: 5000,
      activationCount: 1,
      lastActivatedAt: now - 3 * 60 * 1000,
    };
    expect(classifyTabBehavior(tab, now)).toBe('mayfly');
  });

  it('classifies youtube or reddit with heavy engagement as abyss', () => {
    const tab = {
      url:             'https://www.youtube.com/watch?v=123',
      domain:          'www.youtube.com',
      totalActiveTime: 15 * MINUTE,
      activationCount: 5,
      lastActivatedAt: now - 10 * 1000,
    };
    expect(classifyTabBehavior(tab, now)).toBe('abyss');
  });

  it('classifies technical docs with decent read time as grimoire', () => {
    const tab = {
      url:             'https://react.dev/reference/react/useState',
      domain:          'react.dev',
      totalActiveTime: 2 * MINUTE,
      activationCount: 2,
      lastActivatedAt: now - 10 * MINUTE,
    };
    expect(classifyTabBehavior(tab, now)).toBe('grimoire');
  });

  it('classifies shopping tabs dormant for > 24h as hoard', () => {
    const tab = {
      url:             'https://www.amazon.com/dp/B08N5WRWNW',
      domain:          'www.amazon.com',
      totalActiveTime: 20_000,
      activationCount: 2,
      lastActivatedAt: now - 2 * DAY,
    };
    expect(classifyTabBehavior(tab, now)).toBe('hoard');
  });

  it('classifies high past focus abandoned for > 3 days as artifact', () => {
    const tab = {
      url:             'https://medium.com/@author/deep-article',
      domain:          'medium.com',
      totalActiveTime: 25 * MINUTE,
      activationCount: 5,
      lastActivatedAt: now - 5 * DAY,
    };
    expect(classifyTabBehavior(tab, now)).toBe('artifact');
  });

  it('classifies frequent clicking with < 10s per visit as zombie', () => {
    const tab = {
      url:             'https://dashboard.example.com',
      domain:          'dashboard.example.com',
      totalActiveTime: 20_000, // 20s across 5 visits = 4s/visit
      activationCount: 5,
      lastActivatedAt: now - 10 * MINUTE,
    };
    expect(classifyTabBehavior(tab, now)).toBe('zombie');
  });

  it('classifies barely viewed background tabs as phantom', () => {
    const tab = {
      url:             'https://blog.example.com/some-post',
      domain:          'blog.example.com',
      totalActiveTime: 4000, // 4s total
      activationCount: 1,
      lastActivatedAt: now - 30 * MINUTE,
    };
    expect(classifyTabBehavior(tab, now)).toBe('phantom');
  });

  it('classifies actively used tabs with healthy engagement as spark', () => {
    const tab = {
      url:             'https://myapp.local/editor',
      domain:          'myapp.local',
      totalActiveTime: 5 * MINUTE,
      activationCount: 8,
      lastActivatedAt: now - 5 * 1000, // active 5 seconds ago
    };
    expect(classifyTabBehavior(tab, now)).toBe('spark');
  });

  it('awakens a zombie into a spark when focused recently for >= 45s', () => {
    const tab = {
      url:             'https://example.com/interesting-page',
      domain:          'example.com',
      totalActiveTime: 50_000, // 50s focused
      activationCount: 6,      // 6 visits (historically low average)
      lastActivatedAt: now - 2 * MINUTE, // recently active!
    };
    expect(classifyTabBehavior(tab, now)).toBe('spark');
  });

  it('has valid metadata for all 8 archetypes', () => {
    const archetypes = ['phantom', 'zombie', 'artifact', 'mayfly', 'grimoire', 'abyss', 'hoard', 'spark'] as const;
    for (const arch of archetypes) {
      const meta = ARCHETYPE_META[arch];
      expect(meta).toBeDefined();
      expect(meta.icon).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.quote).toContain('*');
    }
  });

  it('detects metamorphosis transitions correctly', () => {
    const awakened = getMetamorphosis('zombie', 'spark');
    expect(awakened?.type).toBe('awakened');
    expect(awakened?.icon).toBe('🌟');

    const materialized = getMetamorphosis('phantom', 'spark');
    expect(materialized?.type).toBe('materialized');

    const petrified = getMetamorphosis('spark', 'artifact');
    expect(petrified?.type).toBe('petrified');

    const consumed = getMetamorphosis('spark', 'abyss');
    expect(consumed?.type).toBe('consumed');

    expect(getMetamorphosis('spark', 'spark')).toBeNull();
    expect(getMetamorphosis(undefined, 'spark')).toBeNull();
  });
});
