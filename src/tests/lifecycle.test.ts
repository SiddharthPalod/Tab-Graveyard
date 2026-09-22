import { describe, it, expect } from 'vitest';
import { evaluateTabLifecycle, formatRelativeTime, formatActiveDuration, LIFECYCLE_THRESHOLDS } from '../core/lifecycle';
import type { TabRecord } from '../core/db';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const makeTab = (overrides: Partial<TabRecord> = {}): TabRecord => ({
  cleanUrl:        'https://example.com',
  url:             'https://example.com',
  title:           'Example',
  domain:          'example.com',
  status:          'alive',
  openedAt:        Date.now(),
  lastActivatedAt: Date.now(),
  totalActiveTime: 0,
  activationCount: 1,
  ...overrides,
});

const DAY = 24 * 60 * 60 * 1000;

// ── evaluateTabLifecycle ───────────────────────────────────────────────────────
describe('evaluateTabLifecycle', () => {
  it('returns alive for a recently active tab', () => {
    const tab = makeTab({ lastActivatedAt: Date.now() - DAY });
    expect(evaluateTabLifecycle(tab)).toBe('alive');
  });

  it('returns aging after 3 days of inactivity', () => {
    const tab = makeTab({ lastActivatedAt: Date.now() - LIFECYCLE_THRESHOLDS.AGING_MS - 1 });
    expect(evaluateTabLifecycle(tab)).toBe('aging');
  });

  it('returns forgotten after 14 days of inactivity', () => {
    const tab = makeTab({ lastActivatedAt: Date.now() - LIFECYCLE_THRESHOLDS.FORGOTTEN_MS - 1 });
    expect(evaluateTabLifecycle(tab)).toBe('forgotten');
  });

  it('returns dead after 30 days of inactivity', () => {
    const tab = makeTab({ lastActivatedAt: Date.now() - LIFECYCLE_THRESHOLDS.DEAD_MS - 1 });
    expect(evaluateTabLifecycle(tab)).toBe('dead');
  });

  it('a manually buried tab always returns dead regardless of lastActivatedAt', () => {
    const tab = makeTab({ status: 'dead', lastActivatedAt: Date.now() }); // recent, but dead
    expect(evaluateTabLifecycle(tab)).toBe('dead');
  });

  it('uses provided now timestamp correctly', () => {
    const past = Date.now() - 10 * DAY; // lastActivated 10 days ago
    const tab  = makeTab({ lastActivatedAt: past });
    // At "now" = lastActivated + 14d + 1ms, tab should be forgotten
    const futureNow = past + LIFECYCLE_THRESHOLDS.FORGOTTEN_MS + 1;
    expect(evaluateTabLifecycle(tab, futureNow)).toBe('forgotten');
  });
});

// ── formatRelativeTime ────────────────────────────────────────────────────────
describe('formatRelativeTime', () => {
  it('returns "just now" for very recent timestamps', () => {
    expect(formatRelativeTime(Date.now() - 5000)).toBe('just now');
  });

  it('returns minutes for timestamps < 1 hour ago', () => {
    expect(formatRelativeTime(Date.now() - 30 * 60 * 1000)).toBe('30m ago');
  });

  it('returns hours for timestamps < 1 day ago', () => {
    expect(formatRelativeTime(Date.now() - 5 * 60 * 60 * 1000)).toBe('5h ago');
  });

  it('returns days for timestamps > 1 day ago', () => {
    expect(formatRelativeTime(Date.now() - 3 * DAY)).toBe('3d ago');
  });
});

// ── formatActiveDuration ──────────────────────────────────────────────────────
describe('formatActiveDuration', () => {
  it('returns seconds for durations < 1 minute', () => {
    expect(formatActiveDuration(30_000)).toBe('30s');
  });

  it('returns minutes for durations < 1 hour', () => {
    expect(formatActiveDuration(5 * 60 * 1000)).toBe('5m');
  });

  it('returns hours+minutes for long durations', () => {
    expect(formatActiveDuration((2 * 60 + 15) * 60 * 1000)).toBe('2h 15m');
  });

  it('handles zero', () => {
    expect(formatActiveDuration(0)).toBe('0s');
  });
});
