import { describe, it, expect } from 'vitest';
import { computeLevelInfo } from '../core/telemetry';

describe('telemetry & level progression', () => {
  it('starts at Level 1 for a new gravedigger', () => {
    const info = computeLevelInfo({
      tabsPurged: 0,
      tabsRevived: 0,
      tabsSwept: 0,
      tombstonesCreated: 0,
    }, 0);

    expect(info.level).toBe(1);
    expect(info.title).toBe('Gravedigger');
    expect(info.currentXp).toBe(0);
    expect(info.nextLevelXp).toBe(25);
    expect(info.progress).toBe(0);
  });

  it('levels up as actions and buried tabs accumulate', () => {
    // 3 revives (60 XP) + 1 purge (12 XP) = 72 XP -> Level 3 (Caretaker)
    const info = computeLevelInfo({
      tabsPurged: 1,
      tabsRevived: 3,
      tabsSwept: 0,
      tombstonesCreated: 0,
    }, 0);

    expect(info.level).toBe(3);
    expect(info.title).toBe('Caretaker');
    expect(info.currentXp).toBe(72);
    expect(info.progress).toBeGreaterThan(0);
  });

  it('reaches higher ranks with massive cleanups and tombstones', () => {
    const info = computeLevelInfo({
      tabsPurged: 20,         // 240 XP
      tabsRevived: 10,        // 200 XP
      tabsSwept: 15,          // 120 XP
      tombstonesCreated: 5,   // 125 XP
    }, 10);                   // 30 XP -> Total: 715 XP (Crypt Lord: 600+)

    expect(info.level).toBe(8);
    expect(info.title).toBe('Crypt Lord');
    expect(info.currentXp).toBe(715);
  });
});
