/**
 * src/store/useTabs.ts  — State management layer. All async/DB ops live here.
 * JS devs own this file. Zero JSX. Zero Tailwind.
 *
 * Exposes a clean Redux-like interface to the UI layer — no DB or browser
 * internals leak upward. UI components receive prepared data and actions.
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { db, TabRecord, TombstoneRecord, TombstoneTabItem } from '../core/db';
import { evaluateTabLifecycle } from '../core/lifecycle';
import { generateTombstoneTitle } from '../core/tombstoneUtils';
import { normalizeUrl, isTrackableUrl } from '../core/urlUtils';
import {
  TabArchetype,
  TabViewModel,
  toTabViewModel,
  ARCHETYPE_META,
} from '../core/behavior';
import { groupTabsIntoTemporalSessions, TemporalSession } from '../core/sessionUtils';
import {
  FilterOptions,
  DomainCount,
  filterAndSortTabs,
  extractTopDomains,
  filterTombstones,
  filterTemporalSessions,
} from '../core/searchUtils';

export interface TabActions {
  revive:                       (tab: TabRecord) => Promise<void>;
  purge:                        (cleanUrl: string) => Promise<void>;
  sweep:                        (tab: TabRecord) => Promise<void>;
  resurrectAll:                 (limit?: number) => Promise<void>;
  simulateAging:                (days?: number) => Promise<void>;
  collapseToTombstone:          (tabs: TabRecord[], customTitle?: string) => Promise<void>;
  resurrectTombstone:           (tombstone: TombstoneRecord) => Promise<void>;
  shatterTombstone:             (id: string) => Promise<void>;
  reviveTombstoneUrl:           (tombstoneId: string, item: TombstoneTabItem) => Promise<void>;
  bundleGravesToTombstone:      (tabs: TabRecord[], customTitle?: string) => Promise<void>;
  cremateOldest:                (keepCount?: number) => Promise<number>;
  sweepByArchetype:             (archetype: TabArchetype) => Promise<void>;
  collapseArchetypeToTombstone: (archetype: TabArchetype) => Promise<void>;
  resurrectSession:             (session: TemporalSession) => Promise<void>;
  refresh:                      () => Promise<void>;
  // Store-level state mutations
  setFilter:                    (update: Partial<FilterOptions>) => void;
  resetFilters:                 () => void;
  setKeepCount:                 (count: number) => void;
}

export interface TabStore {
  // Prepared view models (living & buried)
  allBuriedTabs:            TabViewModel[];
  allLivingTabs:            TabViewModel[];
  filteredBuriedTabs:       TabViewModel[];
  filteredLivingTabs:       TabViewModel[];
  // Aliases for seamless UI consumption
  buriedTabs:               TabViewModel[];
  livingTabs:               TabViewModel[];

  // Tombstones & Sessions
  tombstones:               TombstoneRecord[];
  filteredTombstones:       TombstoneRecord[];
  temporalSessions:         TemporalSession[];
  filteredTemporalSessions: TemporalSession[];

  // Archetype & Domain aggregations
  archetypes:               Record<TabArchetype, TabViewModel[]>;
  topDomains:               DomainCount[];

  // Filter & Search state (Single source of truth)
  filters:                  FilterOptions;
  activeFilterCount:        number;
  hasActiveFilters:         boolean;

  // Persistence settings
  keepCount:                number;
  cremateCount:             number;

  latestAwakening?:         string;
  loading:                  boolean;
  actions:                  TabActions;
}

/** Polls IndexedDB and synchronizes ground truth with Chrome open tabs */
export function useTabs(): TabStore {
  const [tabs, setTabs]                         = useState<TabRecord[]>([]);
  const [tombstones, setTombstones]             = useState<TombstoneRecord[]>([]);
  const [awakening, setAwakening]               = useState<string | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [keepCount, setKeepCountState]          = useState<number>(20);
  const [filters, setFilters]                   = useState<FilterOptions>({
    query:  '',
    sortBy: 'recent',
  });

  // Load user's saved retention preference from chrome.storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['graveyardKeepCount'], (res) => {
        if (typeof res.graveyardKeepCount === 'number') {
          setKeepCountState(res.graveyardKeepCount);
        }
      });
    }
  }, []);

  const setKeepCount = useCallback((val: number) => {
    const num = Math.max(0, isNaN(val) ? 0 : val);
    setKeepCountState(num);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ graveyardKeepCount: num });
    }
  }, []);

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

      // Update archetypes and detect awakening
      let foundAwakening: string | null = null;
      for (const t of records) {
        if (t.status !== 'dead') {
          const vm = toTabViewModel(t, now);
          const currentArch = vm.archetype;
          if (!t.previousArchetype) {
            t.previousArchetype = currentArch;
            db.tabs.update(t.cleanUrl, { previousArchetype: currentArch }).catch(() => {});
          } else if (t.previousArchetype !== currentArch) {
            if ((t.previousArchetype === 'zombie' || t.previousArchetype === 'phantom') && currentArch === 'spark') {
              foundAwakening = `* A ${t.previousArchetype.toUpperCase()} has awakened into a SPARK! Your DETERMINATION grows.`;
            }
          }
        }
      }
      if (foundAwakening) setAwakening(foundAwakening);

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

  // Transform raw records into enriched TabViewModel instances with pre-computed archetype/metamorphosis
  const viewModels = useMemo(() => {
    const now = Date.now();
    return tabs.map((t) => toTabViewModel(t, now));
  }, [tabs]);

  const allBuriedTabs = useMemo(
    () => viewModels.filter((t) => t.status === 'dead').sort((a, b) => b.lastActivatedAt - a.lastActivatedAt),
    [viewModels],
  );

  const allLivingTabs = useMemo(
    () => viewModels.filter((t) => t.status !== 'dead').sort((a, b) => b.lastActivatedAt - a.lastActivatedAt),
    [viewModels],
  );

  // Group living tabs into the 8 Behavioral Archetypes
  const archetypes = useMemo(() => {
    const map: Record<TabArchetype, TabViewModel[]> = {
      phantom:  [],
      zombie:   [],
      artifact: [],
      mayfly:   [],
      grimoire: [],
      abyss:    [],
      hoard:    [],
      spark:    [],
    };
    for (const tab of allLivingTabs) {
      map[tab.archetype].push(tab);
    }
    return map;
  }, [allLivingTabs]);

  // Cluster buried tabs into temporal sessions
  const temporalSessions = useMemo(() => {
    return groupTabsIntoTemporalSessions(allBuriedTabs);
  }, [allBuriedTabs]);

  // ── Selectors (Pre-computed & Filtered for UI) ─────────────────────────────

  const filteredBuriedTabs = useMemo(
    () => filterAndSortTabs(allBuriedTabs, filters),
    [allBuriedTabs, filters],
  );

  const filteredLivingTabs = useMemo(
    () => filterAndSortTabs(allLivingTabs, filters),
    [allLivingTabs, filters],
  );

  const filteredTombstones = useMemo(
    () => filterTombstones(tombstones, filters.query, filters.domain),
    [tombstones, filters.query, filters.domain],
  );

  const filteredTemporalSessions = useMemo(
    () => filterTemporalSessions(temporalSessions, filters.query, filters.domain),
    [temporalSessions, filters.query, filters.domain],
  );

  const topDomains = useMemo(
    () => extractTopDomains([...allBuriedTabs, ...allLivingTabs], 8),
    [allBuriedTabs, allLivingTabs],
  );

  const activeFilterCount = useMemo(() => {
    return (
      (filters.domain ? 1 : 0) +
      (filters.archetype ? 1 : 0) +
      (filters.minAgeDays ? 1 : 0) +
      (filters.sortBy && filters.sortBy !== 'recent' ? 1 : 0)
    );
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.query ||
      filters.domain ||
      filters.archetype ||
      filters.minAgeDays ||
      (filters.sortBy && filters.sortBy !== 'recent'),
    );
  }, [filters]);

  const cremateCount = useMemo(() => {
    return Math.max(0, allBuriedTabs.length - keepCount);
  }, [allBuriedTabs.length, keepCount]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const setFilter = useCallback((update: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...update }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ query: '', sortBy: 'recent' });
  }, []);

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
    for (const tab of allBuriedTabs.slice(0, limit)) await revive(tab);
  };

  const simulateAging = async (days = 4) => {
    const offsetMs = days * 24 * 60 * 60 * 1000;
    for (const tab of allLivingTabs) {
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
  const cremateOldest = async (limitCount?: number) => {
    const targetKeep = typeof limitCount === 'number' ? limitCount : keepCount;
    const deletedCount = await db.cremateOldestDead(targetKeep);
    await loadData();
    return deletedCount;
  };

  /**
   * One-click sweep for an entire behavioral archetype.
   * Closes all tabs belonging to that archetype in Chrome and marks them dead.
   */
  const sweepByArchetype = async (archetype: TabArchetype) => {
    const targets = archetypes[archetype];
    if (!targets || targets.length === 0) return;

    const tabIds = targets.map((t) => t.tabId).filter((id): id is number => typeof id === 'number');
    if (tabIds.length > 0) {
      try {
        await chrome.tabs.remove(tabIds);
      } catch (err) {
        console.warn('[useTabs] Some tabs were already closed:', err);
      }
    }
    for (const t of targets) {
      await db.markTabDeadByUrl(t.cleanUrl);
    }
    await loadData();
  };

  /**
   * Collapses an entire archetype into a dedicated Tombstone.
   */
  const collapseArchetypeToTombstone = async (archetype: TabArchetype) => {
    const targets = archetypes[archetype];
    if (!targets || targets.length === 0) return;
    const meta = ARCHETYPE_META[archetype];
    await collapseToTombstone(targets, `${meta.icon} ${meta.name} BUNDLE`);
  };

  /**
   * Reopens all tabs in a temporal session back into Chrome.
   */
  const resurrectSession = async (session: TemporalSession) => {
    for (const item of session.tabs) {
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
        console.error('[useTabs] Failed to resurrect session URL:', item.url, err);
      }
    }
    await loadData();
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
    sweepByArchetype,
    collapseArchetypeToTombstone,
    resurrectSession,
    refresh: loadData,
    setFilter,
    resetFilters,
    setKeepCount,
  };

  return {
    // Both aliases and explicit names provided
    buriedTabs: filteredBuriedTabs,
    livingTabs: filteredLivingTabs,
    allBuriedTabs,
    allLivingTabs,
    filteredBuriedTabs,
    filteredLivingTabs,
    tombstones,
    filteredTombstones,
    temporalSessions,
    filteredTemporalSessions,
    archetypes,
    topDomains,
    filters,
    activeFilterCount,
    hasActiveFilters,
    keepCount,
    cremateCount,
    latestAwakening: awakening || undefined,
    loading,
    actions,
  };
}
