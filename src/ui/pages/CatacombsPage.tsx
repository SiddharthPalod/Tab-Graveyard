import React, { useState } from 'react';
import { cls, QUOTES } from '../tokens';
import { formatRelativeTime } from '../../core/lifecycle';
import type { TombstoneRecord, TombstoneTabItem } from '../../core/db';
import type { TemporalSession } from '../../core/sessionUtils';
import type { TabActions } from '../../store/useTabs';

interface CatacombsPageProps {
  tombstones:       TombstoneRecord[];
  temporalSessions: TemporalSession[];
  searchQuery:      string;
  loading:          boolean;
  actions:          Pick<
    TabActions,
    'resurrectTombstone' | 'shatterTombstone' | 'reviveTombstoneUrl' | 'resurrectSession'
  >;
}

export const CatacombsPage: React.FC<CatacombsPageProps> = ({
  tombstones,
  temporalSessions,
  searchQuery,
  loading,
  actions,
}) => {
  // Track which tombstones and sessions are expanded
  const [expandedIds, setExpandedIds]               = useState<Record<string, boolean>>({});
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className={`${cls.box} p-5 text-center font-dialogue text-[15px] text-ut-lv`}>
        {QUOTES.checkingDust}
      </div>
    );
  }

  // Filter tombstones by search query
  const q = searchQuery.toLowerCase().trim();
  const filteredTombstones = tombstones.filter((tomb) => {
    if (!q) return true;
    if (tomb.title.toLowerCase().includes(q)) return true;
    return tomb.tabs.some(
      (tab) =>
        tab.title.toLowerCase().includes(q) ||
        tab.domain.toLowerCase().includes(q) ||
        tab.url.toLowerCase().includes(q),
    );
  });

  const filteredSessions = temporalSessions.filter((sess) => {
    if (!q) return true;
    if (sess.title.toLowerCase().includes(q)) return true;
    return sess.tabs.some(
      (tab) =>
        tab.title.toLowerCase().includes(q) ||
        tab.domain.toLowerCase().includes(q) ||
        tab.url.toLowerCase().includes(q),
    );
  });

  const hasContent = filteredTombstones.length > 0 || filteredSessions.length > 0;

  if (!hasContent) {
    return (
      <div className={`${cls.box} p-5 text-center space-y-1.5`}>
        <p className="text-2xl">🪦</p>
        <p className="font-dialogue text-[15px]">
          {searchQuery ? QUOTES.noResults : QUOTES.emptyCatacombs}
        </p>
        {!searchQuery && (
          <p className="font-dialogue text-xs text-zinc-400">{QUOTES.hintCatacombs}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3">
      {/* ── Temporal Sessions (Mass Extinctions / Window Restores) ── */}
      {filteredSessions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="font-pixel text-[8px] text-ut-lv">⚡ TEMPORAL SESSIONS</span>
            <span className="font-dialogue text-xs text-zinc-500">
              (Auto-grouped closed window workspaces)
            </span>
          </div>

          {filteredSessions.map((sess) => {
            const isExp = expandedSessionIds[sess.id] ?? false;
            return (
              <div key={sess.id} className={`${cls.card} p-2 bg-zinc-950 border-ut-orange`}>
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-dialogue text-[15px] text-ut-orange truncate font-bold">
                      ⚡ {sess.title}
                    </h4>
                    <p className="font-dialogue text-xs text-zinc-400">
                      * Closed {formatRelativeTime(sess.timestamp)} • {sess.tabs.length} tabs
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => actions.resurrectSession(sess)}
                      className={`${cls.btn.battle} text-[7.5px] px-1.5 py-0.5 border-ut-orange text-ut-orange hover:bg-ut-orange hover:text-black`}
                      title="Reopen all tabs from this session in Chrome"
                    >
                      ❤️ RESTORE
                    </button>
                    <button
                      onClick={() => toggleSessionExpand(sess.id)}
                      className="font-pixel text-[7.5px] text-zinc-400 hover:text-white px-1"
                    >
                      {isExp ? '[▲]' : '[▼]'}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="mt-1.5 pt-1 border-t border-zinc-800 space-y-1 pl-1">
                    {sess.tabs.map((tab) => (
                      <p key={tab.cleanUrl} className="font-dialogue text-xs text-zinc-400 truncate">
                        • {tab.title || tab.domain} <span className="text-zinc-600">({tab.domain})</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Permanent Tombstone Monuments ── */}
      {filteredTombstones.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="font-pixel text-[8px] text-ut-lv">🪦 PERMANENT TOMBSTONES</span>
            <span className="font-dialogue text-xs text-zinc-500">
              ({filteredTombstones.length} monuments)
            </span>
          </div>

          {filteredTombstones.map((tomb) => {
            const isExpanded = expandedIds[tomb.id] ?? true;
            const tabCount   = tomb.tabs.length;

            return (
              <div key={tomb.id} className={`${cls.box} p-2 bg-ut-bg border-ut-text`}>
                {/* Tombstone Header */}
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base select-none">🪦</span>
                      <h3 className="font-dialogue text-[16px] text-ut-lv truncate font-bold" title={tomb.title}>
                        {tomb.title}
                      </h3>
                    </div>
                    <p className="font-dialogue text-xs text-zinc-400 mt-0.5">
                      * Collapsed {formatRelativeTime(tomb.createdAt)} • {tabCount} {tabCount === 1 ? 'URL' : 'URLs'} bundled
                    </p>
                  </div>

                  {/* Top Tombstone Controls */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => actions.resurrectTombstone(tomb)}
                      className={`${cls.btn.battle} text-[7.5px] px-1.5 py-0.5 border-ut-lv text-ut-lv hover:bg-ut-lv hover:text-ut-bg`}
                      title="Reopen all URLs in Chrome and dissolve tombstone"
                    >
                      ❤️ RESURRECT
                    </button>
                    <button
                      onClick={() => actions.shatterTombstone(tomb.id)}
                      className={`${cls.btn.danger} text-[7.5px] px-1 py-0.5`}
                      title="Permanently remove tombstone without opening"
                    >
                      💔 PURGE
                    </button>
                  </div>
                </div>

                {/* Toggle URL list */}
                <div className="border-t border-ut-muted pt-1 mt-1">
                  <button
                    onClick={() => toggleExpand(tomb.id)}
                    className="w-full flex items-center justify-between text-left font-pixel text-[7.5px] text-zinc-400 hover:text-ut-text py-0.5"
                  >
                    <span>{isExpanded ? '▼ CONTENTS' : '▶ CONTENTS'} ({tabCount} URLs)</span>
                    <span>{isExpanded ? '[COLLAPSE VIEW]' : '[EXPAND VIEW]'}</span>
                  </button>

                  {/* List of URLs inside Tombstone */}
                  {isExpanded && (
                    <div className="mt-1 space-y-1 pl-1 border-l-2 border-ut-muted">
                      {tomb.tabs.map((tab: TombstoneTabItem) => (
                        <div
                          key={tab.cleanUrl}
                          className="flex items-center justify-between gap-2 p-1 bg-black/40 hover:bg-zinc-900 border border-transparent hover:border-ut-muted"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-dialogue text-[14px] text-ut-text truncate" title={tab.title}>
                              • {tab.title || tab.domain}
                            </p>
                            <p className="font-dialogue text-[11px] text-zinc-500 truncate" title={tab.url}>
                              {tab.url}
                            </p>
                          </div>
                          <button
                            onClick={() => actions.reviveTombstoneUrl(tomb.id, tab)}
                            className={`${cls.btn.white} text-[7px] shrink-0`}
                            title="Revive only this single URL"
                          >
                            [⚡ REVIVE]
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
