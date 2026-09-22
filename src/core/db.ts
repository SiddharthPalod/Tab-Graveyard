/**
 * src/core/db.ts  — Pure data layer. Zero React. Zero UI imports.
 * JS devs own this file.
 */
import Dexie, { Table } from 'dexie';
import { normalizeUrl, isTrackableUrl } from './urlUtils';

export interface TabRecord {
  cleanUrl: string;       // Canonical deduplication key
  url: string;            // Original full URL
  title: string;
  domain: string;
  status: 'alive' | 'aging' | 'forgotten' | 'dead';
  tabId?: number;         // Active Chrome tab ID (absent when buried)
  openedAt: number;       // Unix ms
  lastActivatedAt: number;// Unix ms
  totalActiveTime: number;// ms of actual active focus
  activationCount:   number;
  sessionId?:         string;
  previousArchetype?: string;
}

export interface TombstoneTabItem {
  cleanUrl: string;
  url: string;
  title: string;
  domain: string;
}

export interface TombstoneRecord {
  id: string;             // Unique identifier (tomb_timestamp_rand)
  title: string;          // e.g. "React Research (8 URLs)"
  createdAt: number;      // Unix ms
  tabs: TombstoneTabItem[]; // List of URLs and metadata
}

export class GraveyardDB extends Dexie {
  tabs!: Table<TabRecord, string>;
  tombstones!: Table<TombstoneRecord, string>;

  constructor() {
    super('TabGraveyardDB_v2');
    this.version(1).stores({
      tabs: 'cleanUrl, tabId, domain, status, openedAt, lastActivatedAt',
    });
    this.version(2).stores({
      tabs: 'cleanUrl, tabId, domain, status, openedAt, lastActivatedAt',
      tombstones: 'id, createdAt',
    });
  }

  /**
   * ACID upsert — deduplicates by cleanUrl.
   * Aggregates totalActiveTime and activationCount across visits.
   */
  async upsertTab(data: {
    url: string;
    title: string;
    domain: string;
    tabId?: number;
    status?: TabRecord['status'];
    now?: number;
  }): Promise<TabRecord | null> {
    const cleanUrl = normalizeUrl(data.url);
    if (!cleanUrl || !isTrackableUrl(data.url)) return null;

    const now = data.now ?? Date.now();

    return this.transaction('rw', this.tabs, async () => {
      const existing = await this.tabs.get(cleanUrl);
      if (existing) {
        const updated: TabRecord = {
          ...existing,
          url: data.url || existing.url,
          title: data.title || existing.title,
          domain: data.domain || existing.domain,
          tabId: data.tabId !== undefined ? data.tabId : existing.tabId,
          status: data.status || existing.status,
          lastActivatedAt: now,
          activationCount: existing.activationCount + 1,
        };
        await this.tabs.put(updated);
        return updated;
      }
      const record: TabRecord = {
        cleanUrl,
        url: data.url,
        title: data.title || 'New Tab',
        domain: data.domain,
        tabId: data.tabId,
        status: data.status ?? 'alive',
        openedAt: now,
        lastActivatedAt: now,
        totalActiveTime: 0,
        activationCount: 1,
      };
      await this.tabs.put(record);
      return record;
    });
  }

  /** ACID — atomically accumulate active focus duration */
  async addActiveTime(tabId: number, durationMs: number): Promise<void> {
    if (durationMs <= 0) return;
    await this.transaction('rw', this.tabs, async () => {
      const rec = await this.tabs.where('tabId').equals(tabId).first();
      if (rec) {
        await this.tabs.update(rec.cleanUrl, {
          totalActiveTime: rec.totalActiveTime + durationMs,
        });
      }
    });
  }

  /** ACID — mark dead, finalize active time, unlink tabId */
  async markTabDead(tabId: number, extraMs = 0): Promise<void> {
    await this.transaction('rw', this.tabs, async () => {
      const rec = await this.tabs.where('tabId').equals(tabId).first();
      if (rec) {
        await this.tabs.update(rec.cleanUrl, {
          status: 'dead',
          tabId: undefined,
          totalActiveTime: rec.totalActiveTime + Math.max(0, extraMs),
        });
      }
    });
  }

  /** ACID — mark dead by cleanUrl directly */
  async markTabDeadByUrl(cleanUrl: string): Promise<void> {
    await this.transaction('rw', this.tabs, async () => {
      const rec = await this.tabs.get(cleanUrl);
      if (rec) {
        await this.tabs.update(cleanUrl, {
          status: 'dead',
          tabId: undefined,
        });
      }
    });
  }

  /**
   * ACID Transaction: Collapse a group of tabs into a Tombstone.
   * Creates the tombstone bundle and marks constituent tabs as dead in the tabs table.
   */
  async createTombstone(title: string, tabItems: TombstoneTabItem[]): Promise<TombstoneRecord> {
    const record: TombstoneRecord = {
      id: 'tomb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      createdAt: Date.now(),
      tabs: tabItems,
    };

    await this.transaction('rw', this.tabs, this.tombstones, async () => {
      await this.tombstones.put(record);
      for (const item of tabItems) {
        const existing = await this.tabs.get(item.cleanUrl);
        if (existing) {
          await this.tabs.update(item.cleanUrl, {
            status: 'dead',
            tabId: undefined,
          });
        }
      }
    });

    return record;
  }

  /**
   * Deletes a tombstone from the catacombs.
   */
  async deleteTombstone(id: string): Promise<void> {
    await this.tombstones.delete(id);
  }

  /**
   * Removes a single URL from a tombstone. If no URLs remain, dissolves the tombstone.
   */
  async removeTabFromTombstone(tombstoneId: string, cleanUrl: string): Promise<void> {
    await this.transaction('rw', this.tombstones, async () => {
      const tombstone = await this.tombstones.get(tombstoneId);
      if (!tombstone) return;
      const remaining = tombstone.tabs.filter((t) => t.cleanUrl !== cleanUrl);
      if (remaining.length === 0) {
        await this.tombstones.delete(tombstoneId);
      } else {
        await this.tombstones.update(tombstoneId, { tabs: remaining });
      }
    });
  }

  /**
   * Cremates the oldest dead tabs beyond `keepCount`.
   * Preserves the newest `keepCount` dead tabs and permanently deletes the rest.
   * Returns the count of deleted tabs.
   */
  async cremateOldestDead(keepCount: number = 20): Promise<number> {
    const safeKeep = Math.max(0, keepCount);
    return await this.transaction('rw', this.tabs, async () => {
      const deadTabs = await this.tabs.where('status').equals('dead').toArray();
      // Sort newest lastActivatedAt first
      deadTabs.sort((a, b) => b.lastActivatedAt - a.lastActivatedAt);

      if (deadTabs.length <= safeKeep) return 0;

      const toDelete = deadTabs.slice(safeKeep);
      const urlsToDelete = toDelete.map((t) => t.cleanUrl);
      await this.tabs.bulkDelete(urlsToDelete);
      return urlsToDelete.length;
    });
  }

  /**
   * Bundles dead tabs from the Graveyard into a permanent Tombstone in the Catacombs.
   * Removes them from the loose tabs table so the Graveyard stays clean.
   */
  async bundleDeadTabsToTombstone(title: string, tabItems: TombstoneTabItem[]): Promise<TombstoneRecord> {
    const record: TombstoneRecord = {
      id: 'tomb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title,
      createdAt: Date.now(),
      tabs: tabItems,
    };

    await this.transaction('rw', this.tabs, this.tombstones, async () => {
      await this.tombstones.put(record);
      const urls = tabItems.map((t) => t.cleanUrl);
      await this.tabs.bulkDelete(urls);
    });

    return record;
  }
}

export const db = new GraveyardDB();

/** One-time migration from old v1 DB schema */
async function migrateOldDatabase() {
  try {
    const dbs = await indexedDB.databases?.();
    if (!dbs?.some((d) => d.name === 'TabGraveyardDB')) return;

    const oldDexie = new Dexie('TabGraveyardDB');
    await oldDexie.open();
    const oldTable = oldDexie.table('tabs');
    const oldRecords = await oldTable.toArray();

    for (const rec of oldRecords) {
      if (!rec.url || !isTrackableUrl(rec.url)) continue;
      const clean = normalizeUrl(rec.url);
      const existing = await db.tabs.get(clean);
      if (existing) {
        await db.tabs.update(clean, {
          totalActiveTime: existing.totalActiveTime + (rec.totalActiveTime || 0),
          activationCount: existing.activationCount + (rec.activationCount || 1),
          lastActivatedAt: Math.max(existing.lastActivatedAt, rec.lastActivatedAt || 0),
        });
      } else {
        await db.tabs.put({
          cleanUrl: clean,
          url: rec.url,
          title: rec.title || 'Archived Tab',
          domain: rec.domain || '',
          status: rec.status || 'dead',
          openedAt: rec.openedAt || Date.now(),
          lastActivatedAt: rec.lastActivatedAt || Date.now(),
          totalActiveTime: rec.totalActiveTime || 0,
          activationCount: rec.activationCount || 1,
        });
      }
    }
    oldDexie.close();
    await Dexie.delete('TabGraveyardDB');
  } catch {
    // Migration already done or DB didn't exist
  }
}

migrateOldDatabase();