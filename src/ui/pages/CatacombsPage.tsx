import React, { useState } from 'react';
import { QUOTES } from '../tokens';
import { formatRelativeTime } from '../../core/lifecycle';
import type { TombstoneRecord, TombstoneTabItem } from '../../core/db';
import type { TemporalSession } from '../../core/sessionUtils';
import type { TabActions } from '../../store/useTabs';
import { DialogueBox, PixelPanel, PixelButton, TypewriterText } from '../components/RPGPrimitives';
import { IconTomb, IconRevive, IconPurge, IconMagic } from '../components/GameIcons';

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
  // Track which tombstones and sessions are expanded in UI
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
      <DialogueBox className="text-center text-rpg-yellow">
        <TypewriterText text={QUOTES.checkingDust} />
      </DialogueBox>
    );
  }

  const hasContent = tombstones.length > 0 || temporalSessions.length > 0;

  if (!hasContent) {
    return (
      <DialogueBox className="text-center space-y-2">
        <div className="flex justify-center text-rpg-mid-gray">
          <IconTomb className="text-4xl" />
        </div>
        <p className="text-rpg-white">
          <TypewriterText text={searchQuery ? QUOTES.noResults : QUOTES.emptyCatacombs} />
        </p>
        {!searchQuery && (
          <p className="text-sm text-rpg-mid-gray">{QUOTES.hintCatacombs}</p>
        )}
      </DialogueBox>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3">
      {/* ── Temporal Sessions (Mass Extinctions / Window Restores) ── */}
      {temporalSessions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <IconMagic className="text-[10px] text-rpg-magic" />
            <span className="font-pixel text-[10px] text-rpg-magic">TEMPORAL SESSIONS</span>
            <span className="font-dialogue text-sm text-rpg-mid-gray">
              (Auto-grouped)
            </span>
          </div>

          {temporalSessions.map((sess) => {
            const isExp = expandedSessionIds[sess.id] ?? false;
            return (
              <PixelPanel key={sess.id} className="!border-rpg-magic !bg-rpg-bg">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-dialogue text-lg text-rpg-magic truncate font-bold flex items-center gap-1">
                      <IconMagic />
                      {sess.title}
                    </h4>
                    <p className="font-dialogue text-sm text-rpg-light-gray">
                      * Closed {formatRelativeTime(sess.timestamp)} • {sess.tabs.length} tabs
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <PixelButton
                      onClick={() => actions.resurrectSession(sess)}
                      className="!border-rpg-magic !text-rpg-magic hover:!bg-rpg-magic hover:!text-rpg-bg gap-1 flex items-center"
                    >
                      <IconRevive />
                      <span>[RESTORE]</span>
                    </PixelButton>
                    <button
                      onClick={() => toggleSessionExpand(sess.id)}
                      className="font-pixel text-[8px] text-rpg-mid-gray hover:text-rpg-white px-1 cursor-pointer"
                    >
                      {isExp ? '[▲]' : '[▼]'}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="mt-2 pt-1 border-t-2 border-rpg-mid-gray space-y-1 pl-1">
                    {sess.tabs.map((tab) => (
                      <p key={tab.cleanUrl} className="font-dialogue text-sm text-rpg-light-gray truncate">
                        • {tab.title || tab.domain} <span className="text-rpg-mid-gray">({tab.domain})</span>
                      </p>
                    ))}
                  </div>
                )}
              </PixelPanel>
            );
          })}
        </div>
      )}

      {/* ── Permanent Tombstone Monuments ── */}
      {tombstones.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <IconTomb className="text-[10px] text-rpg-yellow" />
            <span className="font-pixel text-[10px] text-rpg-yellow">PERMANENT TOMBSTONES</span>
            <span className="font-dialogue text-sm text-rpg-mid-gray">
              ({tombstones.length} monuments)
            </span>
          </div>

          {tombstones.map((tomb) => {
            const isExpanded = expandedIds[tomb.id] ?? true;
            const tabCount   = tomb.tabs.length;

            return (
              <DialogueBox key={tomb.id} className="p-2 text-sm !border-[2px]">
                {/* Tombstone Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-rpg-yellow">
                      <IconTomb className="text-xl shrink-0" />
                      <h3 className="font-dialogue text-lg truncate font-bold" title={tomb.title}>
                        {tomb.title}
                      </h3>
                    </div>
                    <p className="font-dialogue text-sm text-rpg-light-gray mt-1">
                      * Collapsed {formatRelativeTime(tomb.createdAt)} • {tabCount} {tabCount === 1 ? 'URL' : 'URLs'} bundled
                    </p>
                  </div>

                  {/* Top Tombstone Controls */}
                  <div className="flex items-center gap-1 shrink-0 mt-1">
                    <PixelButton onClick={() => actions.resurrectTombstone(tomb)} className="gap-1 flex items-center">
                      <IconRevive />
                      <span>[RESURRECT]</span>
                    </PixelButton>
                    <PixelButton
                      onClick={() => actions.shatterTombstone(tomb.id)}
                      className="!border-rpg-soul !text-rpg-soul hover:!bg-rpg-soul hover:!text-rpg-bg gap-1 flex items-center"
                    >
                      <IconPurge />
                      <span>[! PURGE]</span>
                    </PixelButton>
                  </div>
                </div>

                {/* Toggle URL list */}
                <div className="border-t-2 border-rpg-mid-gray pt-2 mt-2">
                  <button
                    onClick={() => toggleExpand(tomb.id)}
                    className="w-full flex items-center justify-between text-left font-pixel text-[8px] text-rpg-light-gray hover:text-rpg-white py-1 cursor-pointer"
                  >
                    <span>{isExpanded ? '▼ CONTENTS' : '▶ CONTENTS'} ({tabCount} URLs)</span>
                    <span>{isExpanded ? '[COLLAPSE]' : '[EXPAND]'}</span>
                  </button>

                  {/* List of URLs inside Tombstone */}
                  {isExpanded && (
                    <div className="mt-2 space-y-1 pl-2 border-l-2 border-rpg-mid-gray">
                      {tomb.tabs.map((tab: TombstoneTabItem) => (
                        <div
                          key={tab.cleanUrl}
                          className="flex items-center justify-between gap-2 p-1 hover:bg-rpg-dark-gray"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-dialogue text-base text-rpg-white truncate" title={tab.title}>
                              • {tab.title || tab.domain}
                            </p>
                            <p className="font-dialogue text-xs text-rpg-mid-gray truncate" title={tab.url}>
                              {tab.url}
                            </p>
                          </div>
                          <PixelButton
                            onClick={() => actions.reviveTombstoneUrl(tomb.id, tab)}
                            className="!px-1 !py-0.5 !text-[6px] gap-1 flex items-center"
                          >
                            <IconRevive />
                            <span>[REVIVE]</span>
                          </PixelButton>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogueBox>
            );
          })}
        </div>
      )}
    </div>
  );
};
