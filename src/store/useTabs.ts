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
import {
  computeLevelInfo,
  loadTelemetry,
  recordTelemetryEvent,
  LevelInfo,
  TelemetryStats,
} from '../core/telemetry';
import {
  TopicCluster,
  GraveyardLocalStats,
  clusterTabsByTopics,
  computeGraveyardStats,
} from '../core/topicUtils';

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
  collapseTopicToTombstone:     (topic: TopicCluster) => Promise<void>;
  resurrectSession:             (session: TemporalSession) => Promise<void>;
  purgeSession:                 (session: TemporalSession) => Promise<void>;
  convertSessionToTombstone:    (session: TemporalSession, customTitle?: string) => Promise<void>;
  renameTombstone:              (id: string, newTitle: string) => Promise<void>;
  purgeSelected:                (tabs: TabRecord[]) => Promise<void>;
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

  // Phase 8: Graveyard Topics (Forgotten Interests) & Local Statistics
  graveyardTopics:          TopicCluster[];
  graveyardStats:           GraveyardLocalStats;

  // Filter & Search state (Single source of truth)
  filters:                  FilterOptions;
  activeFilterCount:        number;
  hasActiveFilters:         boolean;

  // Persistence settings
  keepCount:                number;
  cremateCount:             number;

  // RPG Level Progression & Telemetry
  levelInfo:                LevelInfo;

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
  const [telemetry, setTelemetry]               = useState<TelemetryStats>({
    tabsPurged: 0,
    tabsRevived: 0,
    tabsSwept: 0,
    tombstonesCreated: 0,
  });
  const [filters, setFilters]                   = useState<FilterOptions>({
    query:  '',
    sortBy: 'recent',
  });

  const refreshTelemetry = useCallback(async () => {
    const stats = await loadTelemetry();
    setTelemetry(stats);
  }, []);

  // Load user's saved retention preference and telemetry from storage
  useEffect(() => {
    refreshTelemetry();
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['graveyardKeepCount'], (res) => {
        if (typeof res.graveyardKeepCount === 'number') {
          setKeepCountState(res.graveyardKeepCount);
        }
      });
    }
  }, [refreshTelemetry]);

  const setKeepCount = useCallback((val: number) => {
    const num = Math.max(0, isNaN(val) ? 0 : val);
    setKeepCountState(num);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ graveyardKeepCount: num });
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      await refreshTelemetry();
      const now     = Date.now();
      const records = await db.tabs.toArray();
      const tombs   = await db.tombstones.toArray();

      // Ground-truth reconciliation with Chrome open tabs
      // Cross-reference DB against live Chrome tabs to ensure real-time accuracy & tabId syncing
      if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
        try {
          const openChromeTabs = await chrome.tabs.query({});
          const liveTabsMap    = new Map<string, number>(); // cleanUrl -> tabId

          for (const oct of openChromeTabs) {
            const raw = oct.url || oct.pendingUrl || '';
            if (oct.id && isTrackableUrl(raw)) {
              const clean = normalizeUrl(raw);
              if (clean) liveTabsMap.set(clean, oct.id);
            }
          }

          // Reconcile DB tabs against live Chrome tabs
          for (const r of records) {
            const liveTabId = liveTabsMap.get(r.cleanUrl);
            if (liveTabId !== undefined) {
              // Tab is actively open in Chrome! Ensure tabId is up-to-date
              if (r.tabId !== liveTabId) {
                r.tabId = liveTabId;
                await db.tabs.update(r.cleanUrl, { tabId: liveTabId }).catch(() => {});
              }
            } else if (r.status !== 'dead') {
              // If a record in DB was living, but is NOT physically open in Chrome, mark it dead!
              r.status = 'dead';
              r.tabId  = undefined;
              await db.markTabDeadByUrl(r.cleanUrl).catch(() => {});
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

  // Phase 8: Extract topic clusters from buried tabs ("Forgotten Interests")
  const graveyardTopics = useMemo(() => {
    return clusterTabsByTopics(allBuriedTabs, 2);
  }, [allBuriedTabs]);

  // Aggregate local statistics
  const graveyardStats = useMemo(() => {
    return computeGraveyardStats(allBuriedTabs, graveyardTopics);
  }, [allBuriedTabs, graveyardTopics]);

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

  const levelInfo = useMemo(() => {
    return computeLevelInfo(telemetry, allBuriedTabs.length);
  }, [telemetry, allBuriedTabs.length]);

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
    await recordTelemetryEvent('revive', 1);
    await loadData();
  };

  const purge = async (cleanUrl: string) => {
    await db.tabs.delete(cleanUrl);
    await recordTelemetryEvent('purge', 1);
    await loadData();
  };

  const sweep = async (tab: TabRecord) => {
    let closedInChrome = false;

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      // 1. Try closing by tab.tabId first
      if (typeof tab.tabId === 'number') {
        try {
          await chrome.tabs.remove(tab.tabId);
          closedInChrome = true;
        } catch {
          // tabId may be stale or tab was detached; proceed to fallback query
        }
      }

      // 2. Fallback: Query all open tabs in Chrome to find matching URL
      if (!closedInChrome && chrome.tabs.query) {
        try {
          const openTabs = await chrome.tabs.query({});
          for (const ot of openTabs) {
            const raw = ot.url || ot.pendingUrl || '';
            if (ot.id && isTrackableUrl(raw) && normalizeUrl(raw) === tab.cleanUrl) {
              try {
                await chrome.tabs.remove(ot.id);
                closedInChrome = true;
                break;
              } catch {
                // Ignore removal failure
              }
            }
          }
        } catch (err) {
          console.warn('[useTabs] Failed to query Chrome tabs during sweep:', err);
        }
      }
    }

    // 3. Mark dead in IndexedDB (moves to Graveyard) & record telemetry
    await db.tabs.update(tab.cleanUrl, { status: 'dead', tabId: undefined });
    await recordTelemetryEvent('sweep', 1);
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
    await recordTelemetryEvent('tombstone', 1);

    // Close all open tabs in Chrome
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const tabIdsToClose = new Set<number>();
        const targetCleanUrls = new Set(selectedTabs.map((t) => t.cleanUrl));

        if (chrome.tabs.query) {
          const openTabs = await chrome.tabs.query({});
          for (const ot of openTabs) {
            const raw = ot.url || ot.pendingUrl || '';
            if (ot.id && isTrackableUrl(raw) && targetCleanUrls.has(normalizeUrl(raw))) {
              tabIdsToClose.add(ot.id);
            }
          }
        }

        for (const t of selectedTabs) {
          if (typeof t.tabId === 'number') tabIdsToClose.add(t.tabId);
        }

        if (tabIdsToClose.size > 0) {
          await chrome.tabs.remove(Array.from(tabIdsToClose)).catch((err) => {
            console.warn('[useTabs] Some tabs were already closed in Chrome:', err);
          });
        }
      } catch (err) {
        console.warn('[useTabs] Error closing collapsed tabs in Chrome:', err);
      }
    }

    await loadData();
  };

  /**
   * Resurrects all URLs inside a Tombstone back into Chrome tabs.
   * Preserves the Permanent Tombstone monument intact unless explicitly shattered.
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

    // Permanent monuments remain standing unless explicitly shattered
    await recordTelemetryEvent('revive', tombstone.tabs.length);
    await loadData();
  };

  /**
   * Permanently shatters a Tombstone without opening its tabs.
   */
  const shatterTombstone = async (id: string) => {
    await db.deleteTombstone(id);
    await recordTelemetryEvent('purge', 1);
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
    await recordTelemetryEvent('revive', 1);
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
    await recordTelemetryEvent('tombstone', 1);
    await loadData();
  };

  /**
   * Cremates the oldest dead tabs beyond keepCount (default 20).
   * Keeps the newest keepCount dead tabs and deletes the rest.
   */
  const cremateOldest = async (limitCount?: number) => {
    const targetKeep = typeof limitCount === 'number' ? limitCount : keepCount;
    const deletedCount = await db.cremateOldestDead(targetKeep);
    if (deletedCount > 0) {
      await recordTelemetryEvent('purge', deletedCount);
    }
    await loadData();
    return deletedCount;
  };

  /**
   * Permanently purges user-selected dead tabs from the Graveyard.
   */
  const purgeSelected = async (selectedTabs: TabRecord[]) => {
    if (!selectedTabs || selectedTabs.length === 0) return;
    const urls = selectedTabs.map((t) => t.cleanUrl);
    await db.tabs.bulkDelete(urls);
    await recordTelemetryEvent('purge', urls.length);
    await loadData();
  };

  /**
   * Converts a Temporal Session into a Permanent Tombstone monument.
   * Removes constituent tabs from loose dead tabs so it cleanly transitions.
   */
  const convertSessionToTombstone = async (session: TemporalSession, customTitle?: string) => {
    const items: TombstoneTabItem[] = session.tabs.map((t) => ({
      cleanUrl: t.cleanUrl,
      url:      t.url,
      title:    t.title || 'Untitled Tab',
      domain:   t.domain || 'web',
    }));
    const titleToUse = customTitle?.trim() || session.title;
    await db.createTombstone(titleToUse, items);
    // Remove the loose dead tabs so the session moves from Temporary to Permanent
    await db.tabs.bulkDelete(session.tabs.map((t) => t.cleanUrl));
    await recordTelemetryEvent('tombstone', 1);
    await loadData();
  };

  /**
   * Renames an existing permanent Tombstone.
   */
  const renameTombstone = async (id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    await db.renameTombstone(id, trimmed);
    await loadData();
  };

  /**
   * One-click sweep for an entire behavioral archetype.
   * Closes all tabs belonging to that archetype in Chrome and marks them dead.
   */
  const sweepByArchetype = async (archetype: TabArchetype) => {
    const targetTabs = archetypes[archetype];
    if (!targetTabs || targetTabs.length === 0) return;

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const tabIdsToClose = new Set<number>();
        const targetCleanUrls = new Set(targetTabs.map((t) => t.cleanUrl));

        // 1. Gather live tabIds from open Chrome tabs
        if (chrome.tabs.query) {
          const openTabs = await chrome.tabs.query({});
          for (const ot of openTabs) {
            const raw = ot.url || ot.pendingUrl || '';
            if (ot.id && isTrackableUrl(raw) && targetCleanUrls.has(normalizeUrl(raw))) {
              tabIdsToClose.add(ot.id);
            }
          }
        }

        // 2. Include any existing tabIds from targetTabs
        for (const t of targetTabs) {
          if (typeof t.tabId === 'number') tabIdsToClose.add(t.tabId);
        }

        if (tabIdsToClose.size > 0) {
          await chrome.tabs.remove(Array.from(tabIdsToClose)).catch((err) => {
            console.warn('[useTabs] Some tabs were already closed:', err);
          });
        }
      } catch (err) {
        console.warn('[useTabs] Error sweeping archetype tabs in Chrome:', err);
      }
    }

    for (const t of targetTabs) {
      await db.tabs.update(t.cleanUrl, { status: 'dead', tabId: undefined });
    }

    if (targetTabs.length > 0) {
      await recordTelemetryEvent('sweep', targetTabs.length);
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
   * Phase 8: One-click collapse an entire detected Topic Cluster into a permanent Tombstone.
   */
  const collapseTopicToTombstone = async (topic: TopicCluster) => {
    if (!topic || topic.tabs.length === 0) return;
    const title = `${topic.icon} ${topic.name}`;
    await bundleGravesToTombstone(topic.tabs, title);
  };

  /**
   * Reopens all tabs in a temporal session back into Chrome and revives them.
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
    if (session.tabs.length > 0) {
      await recordTelemetryEvent('revive', session.tabs.length);
    }
    await loadData();
  };

  /**
   * Permanently purges all tabs in a Temporal Session from IndexedDB.
   */
  const purgeSession = async (session: TemporalSession) => {
    const urls = session.tabs.map((t) => t.cleanUrl);
    await db.tabs.bulkDelete(urls);
    if (urls.length > 0) {
      await recordTelemetryEvent('purge', urls.length);
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
    collapseTopicToTombstone,
    resurrectSession,
    purgeSession,
    convertSessionToTombstone,
    renameTombstone,
    purgeSelected,
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
    graveyardTopics,
    graveyardStats,
    filters,
    activeFilterCount,
    hasActiveFilters,
    keepCount,
    cremateCount,
    levelInfo,
    latestAwakening: awakening || undefined,
    loading,
    actions,
  };
}
