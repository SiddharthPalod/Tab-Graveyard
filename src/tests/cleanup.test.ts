import { describe, it, expect } from 'vitest';
import { partitionForCremation } from '../core/cleanupUtils';

describe('partitionForCremation', () => {
  it('handles empty tab array', () => {
    const { preserved, cremated } = partitionForCremation([], 20);
    expect(preserved).toHaveLength(0);
    expect(cremated).toHaveLength(0);
  });

  it('preserves all tabs when total is less than or equal to keepCount', () => {
    const tabs = [
      { id: 1, lastActivatedAt: 100 },
      { id: 2, lastActivatedAt: 200 },
    ];
    const { preserved, cremated } = partitionForCremation(tabs, 5);
    expect(preserved).toHaveLength(2);
    expect(cremated).toHaveLength(0);
  });

  it('preserves newest N tabs and puts older ones in cremated list', () => {
    const tabs = [
      { id: 1, lastActivatedAt: 100 }, // oldest
      { id: 2, lastActivatedAt: 500 }, // newest
      { id: 3, lastActivatedAt: 300 },
      { id: 4, lastActivatedAt: 200 },
      { id: 5, lastActivatedAt: 400 },
    ];

    // Keep newest 2 (should be id 2 and id 5)
    const { preserved, cremated } = partitionForCremation(tabs, 2);
    expect(preserved.map((t) => t.id)).toEqual([2, 5]);
    expect(cremated.map((t) => t.id)).toEqual([3, 4, 1]);
  });

  it('handles keepCount = 0 (cremates everything)', () => {
    const tabs = [
      { id: 1, lastActivatedAt: 100 },
      { id: 2, lastActivatedAt: 200 },
    ];
    const { preserved, cremated } = partitionForCremation(tabs, 0);
    expect(preserved).toHaveLength(0);
    expect(cremated).toHaveLength(2);
  });

  it('handles custom user input numbers (e.g. 50 out of 70 tabs)', () => {
    const tabs = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      lastActivatedAt: i * 1000,
    }));

    // Keep newest 20, cremating remaining 50
    const { preserved, cremated } = partitionForCremation(tabs, 20);
    expect(preserved).toHaveLength(20);
    expect(cremated).toHaveLength(50);
    // Preserved should have the highest timestamps
    expect(preserved[0].lastActivatedAt).toBe(69000);
    expect(cremated[0].lastActivatedAt).toBe(49000);
  });
});
