/**
 * src/store/useTabs.ts  — State management layer. All async/DB ops live here.
 * JS devs own this file. Zero JSX. Zero Tailwind.
 *
 * Exposes a clean interface to the UI layer — no DB internals leak upward.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db, TabRecord, TombstoneRecord, TombstoneTabItem } from '../core/db';
import { evaluateTabLifecycle } from '../core/lifecycle';
import { generateTombstoneTitle } from '../core/tombstoneUtils';

import { normalizeUrl, isTrackableUrl } from '../core/urlUtils';

export interface TabActions {
  revive:              (tab: TabRecord) => Promise<void>;
  purge:               (cleanUrl: string) => Promise<void>;
  sweep:               (tab: TabRecord) => Promise<void>;
  resurrectAll:        (limit?: number) => Promise<void>;
  simulateAging:       (days?: number) => Promise<void>;
  collapseToTombstone: (tabs: TabRecord[], customTitle?: string) => Promise<void>;
  resurrectTombstone:  (tombstone: TombstoneRecord) => Promise<void>;
  shatterTombstone:    (id: string) => Promise<void>;
  reviveTombstoneUrl:  (tombstoneId: string, item: TombstoneTabItem) => Promise<void>;
  bundleGravesToTombstone: (tabs: TabRecord[], customTitle?: string) => Promise<void>;
  cremateOldest:           (keepCount?: number) => Promise<number>;
  refresh:                 () => Promise<void>;
}

export interface TabStore {
  buriedTabs: TabRecord[];
  livingTabs: TabRecord[];
  tombstones: TombstoneRecord[];
  loading:    boolean;
  actions:    TabActions;
}

/** Polls IndexedDB and synchronizes ground truth with Chrome open tabs */
export function useTabs(): TabStore {
  const [tabs, setTabs]             = useState<TabRecord[]>([]);
  const [tombstones, setTombstones] = useState<TombstoneRecord[]>([]);
  const [loading, setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    try {
      const now     = Date.now();
      const records = await db.tabs.toArray();
      const tombs   = await db.tombstones.toArray();

      // Ground-truth reconciliation with Chrome open tabs
      if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
        try {
          const openChromeTabs = await chrome.tabs.query({});
          const openCleanUrls  = new Set<string>();

          for (const oct of openChromeTabs) {
            const raw = oct.url || oct.pendingUrl || '';
            if (oct.id && isTrackableUrl(raw)) {
              const clean = normalizeUrl(raw);
              if (clean) openCleanUrls.add(clean);
            }
          }

          // If a record in DB is living, but is NOT physically open in Chrome, mark it dead!
          for (const r of records) {
            if (r.status !== 'dead' && !openCleanUrls.has(r.cleanUrl)) {
              r.status = 'dead';
              r.tabId  = undefined;
              await db.markTabDeadByUrl(r.cleanUrl);
            }
          }
        } catch (e) {
          console.warn('[useTabs] chrome.tabs.query unavailable:', e);
        }
      }

      // Evaluate lifecycle on the fly — avoids stale DB status for open tabs
      setTabs(records.map((t) => (t.status !== 'dead' ? { ...t, status: evaluateTabLifecycle(t, now) } : t)));
      setTombstones(tombs.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('[useTabs] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);

    // Instant 0ms reactivity when user opens, closes, or updates tabs in Chrome
    const handleChange = () => { loadData(); };

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.onRemoved.addListener(handleChange);
      chrome.tabs.onCreated.addListener(handleChange);
      chrome.tabs.onUpdated.addListener(handleChange);
    }

    return () => {
      clearInterval(interval);
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.onRemoved.removeListener(handleChange);
        chrome.tabs.onCreated.removeListener(handleChange);
        chrome.tabs.onUpdated.removeListener(handleChange);
      }
    };
  }, [loadData]);

  const buriedTabs = useMemo(
    () => tabs.filter((t) => t.status === 'dead').sort((a, b) => b.lastActivatedAt - a.lastActivatedAt),
    [tabs],
  );

  const livingTabs = useMemo(
    () => tabs.filter((t) => t.status !== 'dead').sort((a, b) => b.lastActivatedAt - a.lastActivatedAt),
    [tabs],
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const revive = async (tab: TabRecord) => {
    const newTab = await chrome.tabs.create({ url: tab.url, active: true });
    await db.upsertTab({ url: tab.url, title: tab.title, domain: tab.domain, tabId: newTab.id, status: 'alive' });
    await loadData();
  };

  const purge = async (cleanUrl: string) => {
    await db.tabs.delete(cleanUrl);
    await loadData();
  };

  const sweep = async (tab: TabRecord) => {
    if (tab.tabId) {
      await chrome.tabs.remove(tab.tabId); // triggers onRemoved → markTabDead
    } else {
      await db.tabs.update(tab.cleanUrl, { status: 'dead' });
    }
    await loadData();
  };

  const resurrectAll = async (limit = 8) => {
    for (const tab of buriedTabs.slice(0, limit)) await revive(tab);
  };

  const simulateAging = async (days = 4) => {
    const offsetMs = days * 24 * 60 * 60 * 1000;
    for (const tab of livingTabs) {
      await db.tabs.update(tab.cleanUrl, { lastActivatedAt: tab.lastActivatedAt - offsetMs });
    }
    chrome.runtime.sendMessage({ type: 'TRIGGER_LIFECYCLE_CHECK' });
    await loadData();
  };

  /**
   * Collapses multiple open tabs into a single Tombstone bundle in the Catacombs.
   * Closes those tabs in Chrome, freeing their RAM instantly.
   */
  const collapseToTombstone = async (selectedTabs: TabRecord[], customTitle?: string) => {
    if (!selectedTabs || selectedTabs.length === 0) return;

    const items: TombstoneTabItem[] = selectedTabs.map((t) => ({
      cleanUrl: t.cleanUrl,
      url:      t.url,
      title:    t.title || 'Untitled Tab',
      domain:   t.domain || 'web',
    }));

    const title = customTitle?.trim() || generateTombstoneTitle(items);
    await db.createTombstone(title, items);

    // Close all open tabs in Chrome
    const tabIdsToClose = selectedTabs.map((t) => t.tabId).filter((id): id is number => typeof id === 'number');
    if (tabIdsToClose.length > 0) {
      try {
        await chrome.tabs.remove(tabIdsToClose);
      } catch (err) {
        console.warn('[useTabs] Some tabs were already closed in Chrome:', err);
      }
    }

    await loadData();
  };

  /**
   * Resurrects all URLs inside a Tombstone back into Chrome tabs, then dissolves the Tombstone.
   */
  const resurrectTombstone = async (tombstone: TombstoneRecord) => {
    for (const item of tombstone.tabs) {
      try {
        const created = await chrome.tabs.create({ url: item.url, active: false });
        await db.upsertTab({
          url:    item.url,
          title:  item.title,
          domain: item.domain,
          tabId:  created.id,
          status: 'alive',
        });
      } catch (err) {
        console.error('[useTabs] Failed to resurrect URL:', item.url, err);
      }
    }

    await db.deleteTombstone(tombstone.id);
    await loadData();
  };

  /**
   * Permanently shatters a Tombstone without opening its tabs.
   */
  const shatterTombstone = async (id: string) => {
    await db.deleteTombstone(id);
    await loadData();
  };

  /**
   * Revives a single URL from inside a Tombstone.
   */
  const reviveTombstoneUrl = async (tombstoneId: string, item: TombstoneTabItem) => {
    const created = await chrome.tabs.create({ url: item.url, active: true });
    await db.upsertTab({
      url:    item.url,
      title:  item.title,
      domain: item.domain,
      tabId:  created.id,
      status: 'alive',
    });
    await db.removeTabFromTombstone(tombstoneId, item.cleanUrl);
    await loadData();
  };

  /**
   * Bundles already-dead tabs from the Graveyard into a permanent Tombstone in Catacombs.
   * Removes them from the loose Graveyard so it stays clean.
   */
  const bundleGravesToTombstone = async (selectedTabs: TabRecord[], customTitle?: string) => {
    if (!selectedTabs || selectedTabs.length === 0) return;

    const items: TombstoneTabItem[] = selectedTabs.map((t) => ({
      cleanUrl: t.cleanUrl,
      url:      t.url,
      title:    t.title || 'Untitled Tab',
      domain:   t.domain || 'web',
    }));

    const title = customTitle?.trim() || generateTombstoneTitle(items);
    await db.bundleDeadTabsToTombstone(title, items);
    await loadData();
  };

  /**
   * Cremates the oldest dead tabs beyond keepCount (default 20).
   * Keeps the newest keepCount dead tabs and deletes the rest.
   */
  const cremateOldest = async (keepCount: number = 20) => {
    const deletedCount = await db.cremateOldestDead(keepCount);
    await loadData();
    return deletedCount;
  };

  const actions: TabActions = {
    revive,
    purge,
    sweep,
    resurrectAll,
    simulateAging,
    collapseToTombstone,
    resurrectTombstone,
    shatterTombstone,
    reviveTombstoneUrl,
    bundleGravesToTombstone,
    cremateOldest,
    refresh: loadData,
  };

  return { buriedTabs, livingTabs, tombstones, loading, actions };
}
