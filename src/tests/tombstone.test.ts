import { describe, it, expect } from 'vitest';
import { generateTombstoneTitle } from '../core/tombstoneUtils';
import type { TombstoneTabItem } from '../core/db';

describe('generateTombstoneTitle', () => {
  it('returns default for empty array', () => {
    expect(generateTombstoneTitle([])).toBe('Empty Tombstone');
  });

  it('formats single domain cleanly', () => {
    const tabs: TombstoneTabItem[] = [
      { cleanUrl: 'https://github.com/a', url: 'https://github.com/a', title: 'A', domain: 'github.com' },
      { cleanUrl: 'https://github.com/b', url: 'https://github.com/b', title: 'B', domain: 'github.com' },
    ];
    expect(generateTombstoneTitle(tabs)).toBe('github.com Rabbit Hole (2 URLs)');
  });

  it('formats 1 URL with singular unit', () => {
    const tabs: TombstoneTabItem[] = [
      { cleanUrl: 'https://react.dev', url: 'https://react.dev', title: 'React', domain: 'react.dev' },
    ];
    expect(generateTombstoneTitle(tabs)).toBe('react.dev Rabbit Hole (1 URL)');
  });

  it('formats two domains nicely', () => {
    const tabs: TombstoneTabItem[] = [
      { cleanUrl: 'https://github.com/a', url: 'https://github.com/a', title: 'A', domain: 'github.com' },
      { cleanUrl: 'https://youtube.com/watch', url: 'https://youtube.com/watch', title: 'YT', domain: 'youtube.com' },
    ];
    expect(generateTombstoneTitle(tabs)).toBe('github.com & youtube.com (2 URLs)');
  });

  it('formats dominant domain with others when 3+ domains and one dominates', () => {
    const tabs: TombstoneTabItem[] = [
      { cleanUrl: 'https://github.com/1', url: 'https://github.com/1', title: '1', domain: 'github.com' },
      { cleanUrl: 'https://github.com/2', url: 'https://github.com/2', title: '2', domain: 'github.com' },
      { cleanUrl: 'https://reddit.com/r/react', url: 'https://reddit.com/r/react', title: 'R', domain: 'reddit.com' },
      { cleanUrl: 'https://youtube.com/v', url: 'https://youtube.com/v', title: 'Y', domain: 'youtube.com' },
    ];
    // github has 2 out of 4 (50%)
    expect(generateTombstoneTitle(tabs)).toBe('github.com & Others (4 URLs)');
  });

  it('formats generic Underground Research when domains are completely scattered', () => {
    const tabs: TombstoneTabItem[] = [
      { cleanUrl: 'https://a.com', url: 'https://a.com', title: 'A', domain: 'a.com' },
      { cleanUrl: 'https://b.com', url: 'https://b.com', title: 'B', domain: 'b.com' },
      { cleanUrl: 'https://c.com', url: 'https://c.com', title: 'C', domain: 'c.com' },
    ];
    expect(generateTombstoneTitle(tabs)).toBe('Underground Research (3 URLs)');
  });
});
