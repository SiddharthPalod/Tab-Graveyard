/**
 * src/background.ts  — Chrome service worker / Engine.
 * JS devs own this file. Zero React. Zero UI.
 */
import { db } from './core/db';
import { evaluateTabLifecycle } from './core/lifecycle';
import { getDomain, isTrackableUrl, normalizeUrl } from './core/urlUtils';

class TabEngine {
  private activeTabId: number | null = null;
  private lastActiveTime: number     = Date.now();

  constructor() {
    this.registerListeners();
    this.initLifecycleAlarm();
    this.syncOpenTabs();
  }

  private async processTab(tab: chrome.tabs.Tab, status: 'alive' | 'dead' = 'alive') {
    const raw = tab.url || tab.pendingUrl || '';
    if (!tab.id || !isTrackableUrl(raw)) return;
    await db.upsertTab({
      url:    raw,
      title:  tab.title || 'Untitled Tab',
      domain: getDomain(raw),
      tabId:  tab.id,
      status,
    });
  }

  private handleTabCreated   = (tab: chrome.tabs.Tab) => this.processTab(tab);

  private handleTabUpdated   = (_id: number, info: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (info.url || info.title || info.status === 'complete') this.processTab(tab);
  };

  private handleTabActivated = async ({ tabId }: chrome.tabs.TabActiveInfo) => {
    const now = Date.now();
    if (this.activeTabId !== null && this.activeTabId !== tabId) {
      await db.addActiveTime(this.activeTabId, now - this.lastActiveTime);
    }
    this.activeTabId    = tabId;
    this.lastActiveTime = now;
    chrome.tabs.get(tabId, (tab) => {
      if (!chrome.runtime.lastError && tab) this.processTab(tab, 'alive');
    });
  };

  private handleTabRemoved = async (tabId: number) => {
    const extra = this.activeTabId === tabId ? Date.now() - this.lastActiveTime : 0;
    if (this.activeTabId === tabId) this.activeTabId = null;
    await db.markTabDead(tabId, extra);
    await this.syncOpenTabs();
  };

  private handleWindowRemoved = async (windowId: number) => {
    const sId = `window_${windowId}_${Date.now()}`;
    await this.syncOpenTabs(sId);
  };

  /**
   * Ground-truth reconciliation:
   * Compares DB records with actual open Chrome tabs.
   * If any tab was closed, marks it dead immediately.
   */
  async syncOpenTabs(sessionId?: string) {
    try {
      const openChromeTabs = await chrome.tabs.query({});
      const openCleanUrls = new Set<string>();

      for (const tab of openChromeTabs) {
        const raw = tab.url || tab.pendingUrl || '';
        if (tab.id && isTrackableUrl(raw)) {
          const clean = normalizeUrl(raw);
          if (clean) {
            openCleanUrls.add(clean);
            await db.upsertTab({
              url:    raw,
              title:  tab.title || 'Untitled Tab',
              domain: getDomain(raw),
              tabId:  tab.id,
              status: 'alive',
            });
          }
        }
      }

      // Reconcile: If any tab in DB is marked living, but not open in Chrome, mark it dead
      const livingInDb = await db.tabs.where('status').notEqual('dead').toArray();
      for (const rec of livingInDb) {
        if (!openCleanUrls.has(rec.cleanUrl)) {
          await db.markTabDeadByUrl(rec.cleanUrl);
          if (sessionId) {
            await db.tabs.update(rec.cleanUrl, { sessionId });
          }
        }
      }

      await this.runDegradationCheck();
    } catch (err) {
      console.warn('[TabEngine] syncOpenTabs error:', err);
    }
  }

  async runDegradationCheck() {
    const now  = Date.now();
    const open = await db.tabs.where('status').notEqual('dead').toArray();
    for (const tab of open) {
      const next = evaluateTabLifecycle(tab, now);
      if (next !== tab.status) await db.tabs.update(tab.cleanUrl, { status: next });
    }

    // Background safety cap: ensures loose dead tabs never exceed 100
    try {
      await db.cremateOldestDead(100);
    } catch {
      // ignore
    }
  }

  private initLifecycleAlarm() {
    chrome.alarms.create('lifecycle', { periodInMinutes: 30 });
  }

  private registerListeners() {
    chrome.tabs.onCreated.addListener(this.handleTabCreated);
    chrome.tabs.onUpdated.addListener(this.handleTabUpdated);
    chrome.tabs.onActivated.addListener(this.handleTabActivated);
    chrome.tabs.onRemoved.addListener(this.handleTabRemoved);
    if (typeof chrome.windows !== 'undefined' && chrome.windows.onRemoved) {
      chrome.windows.onRemoved.addListener(this.handleWindowRemoved);
    }

    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'lifecycle') this.syncOpenTabs();
    });

    chrome.runtime.onMessage.addListener((msg, _s, reply) => {
      if (msg.type === 'TRIGGER_LIFECYCLE_CHECK') {
        this.syncOpenTabs().then(() => reply({ ok: true }));
        return true;
      }
    });
  }
}

new TabEngine();
