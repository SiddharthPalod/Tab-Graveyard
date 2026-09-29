import React, { useState } from 'react';
import { formatRelativeTime } from '../../core/lifecycle';
import type { TombstoneRecord, TombstoneTabItem } from '../../core/db';
import type { TemporalSession } from '../../core/sessionUtils';
import type { TabActions } from '../../store/useTabs';
import { TypewriterText } from '../components/RPGPrimitives';
import {
  IconTomb,
  IconRevive,
  IconPurge,
  IconMagic,
  IconBurger,
  IconFishBucket,
  IconBubbles,
} from '../components/GameIcons';
import { useTheme } from '../themes/useTheme';

interface CatacombsPageProps {
  tombstones:       TombstoneRecord[];
  temporalSessions: TemporalSession[];
  searchQuery:      string;
  loading:          boolean;
  actions:          Pick<
    TabActions,
    | 'resurrectTombstone'
    | 'shatterTombstone'
    | 'reviveTombstoneUrl'
    | 'resurrectSession'
    | 'purgeSession'
    | 'revive'
  >;
}

export const CatacombsPage: React.FC<CatacombsPageProps> = ({
  tombstones,
  temporalSessions,
  searchQuery,
  loading,
  actions,
}) => {
  const { theme } = useTheme();
  const isSponge = theme.id === 'spongebob';

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
      <div className="p-3 bg-rpg-dark-gray/90 border border-rpg-border text-center text-rpg-yellow font-dialogue text-base rounded-sm">
        <TypewriterText text={theme.quotes.checkingDust} />
      </div>
    );
  }

  const hasContent = tombstones.length > 0 || temporalSessions.length > 0;

  if (!hasContent) {
    return (
      <div className="p-6 bg-rpg-dark-gray/80 border border-rpg-border text-center space-y-2 rounded-sm shadow-pixel">
        <div className="flex justify-center text-rpg-mid-gray">
          {isSponge ? (
            <IconBurger className="text-4xl text-[#F9E03B]" />
          ) : (
            <IconTomb className="text-4xl" />
          )}
        </div>
        <p className="text-slate-200 font-sans text-xs">
          <TypewriterText text={searchQuery ? theme.quotes.noResults : theme.quotes.emptyCatacombs} />
        </p>
        {!searchQuery && (
          <p className="text-[11px] text-rpg-light-gray font-sans">{theme.quotes.hintCatacombs}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-2.5">
      {/* ── Permanent Tombstone / Secret Formula Monuments ── */}
      {tombstones.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            {isSponge ? (
              <IconBurger className="text-xs text-[#F9E03B]" />
            ) : (
              <IconTomb className="text-xs text-rpg-yellow" />
            )}
            <span className="font-pixel text-[8px] text-rpg-yellow">
              {theme.catacombs.tombstoneSectionTitle}
            </span>
            <span className="font-sans text-[10.5px] text-rpg-light-gray/70">
              {theme.catacombs.tombstoneMonumentsLabel(tombstones.length)}
            </span>
          </div>

          {tombstones.map((tomb) => {
            const isExpanded = expandedIds[tomb.id] ?? false;
            const tabCount   = tomb.tabs.length;
            const unitLabel  = tabCount === 1 ? theme.catacombs.tabUnitSingular : theme.catacombs.tabUnitPlural;

            return (
              <div key={tomb.id} className="p-2 bg-rpg-dark-gray/80 border border-rpg-border rounded-sm shadow-pixel">
                {/* Tombstone Header */}
                <div
                  className="flex items-start justify-between gap-2 mb-1.5 cursor-pointer"
                  onClick={() => toggleExpand(tomb.id)}
                > 
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-rpg-yellow">
                      {isSponge ? (
                        <IconBurger className="text-sm shrink-0 text-[#F9E03B]" />
                      ) : (
                        <IconTomb className="text-sm shrink-0" />
                      )}
                      <h3 className="font-sans text-[13px] truncate font-semibold text-slate-100" title={tomb.title}>
                        {tomb.title}
                      </h3>
                    </div>
                    <p className="font-sans text-[10.5px] text-rpg-light-gray/80 mt-0.5">
                      Collapsed {formatRelativeTime(tomb.createdAt)} • {tabCount} {unitLabel} bundled
                    </p>
                  </div>

                  {/* Top Tombstone Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => actions.resurrectTombstone(tomb)} 
                      className={theme.cls.btn.revive}
                    >
                      {isSponge ? <IconBurger className="text-xs" /> : <IconRevive className="text-xs" />}
                      <span>{theme.actions.resurrectSession}</span>
                    </button>
                    <button
                      onClick={() => actions.shatterTombstone(tomb.id)}
                      className={theme.cls.btn.danger}
                    >
                      {isSponge ? <IconFishBucket className="text-xs" /> : <IconPurge className="text-xs" />}
                      <span>{theme.actions.purgeSession}</span>
                    </button>
                  </div>
                </div>

                {/* Toggle URL list */}
                <div className="border-t border-rpg-border/60 pt-1 mt-1">
                  {isExpanded && (
                    <div className="mt-1.5 space-y-1 pl-2 border-l border-rpg-border">
                      {tomb.tabs.map((tab: TombstoneTabItem) => (
                        <div
                          key={tab.cleanUrl}
                          className="flex items-center justify-between gap-2 p-1 hover:bg-rpg-surface rounded-none"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-sans text-xs text-slate-200 truncate" title={tab.title}>
                              • {tab.title || tab.domain}
                            </p>
                            <p className="font-sans text-[10px] text-rpg-light-gray/70 truncate" title={tab.url}>
                              {tab.url}
                            </p>
                          </div>
                          <button
                            onClick={() => actions.reviveTombstoneUrl(tomb.id, tab)}
                            className={theme.cls.btn.revive}
                          >
                            {isSponge ? <IconBurger className="text-[10px]" /> : <IconRevive className="text-[10px]" />}
                            <span>{theme.actions.revive}</span>
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

      {/* ── Temporal Sessions (Mass Extinctions / Window Restores) ── */}
      {temporalSessions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            {isSponge ? (
              <IconBubbles className="text-xs text-[#00A3E0]" />
            ) : (
              <IconMagic className="text-xs text-rpg-magic" />
            )}
            <span className="font-pixel text-[8px] text-rpg-magic">
              {theme.catacombs.temporalSectionTitle}
            </span>
            <span className="font-sans text-[10.5px] text-rpg-light-gray/70">
              {theme.catacombs.temporalBadge}
            </span>
          </div>

          {temporalSessions.map((sess) => {
            const isExp = expandedSessionIds[sess.id] ?? false;
            const tabUnit = sess.tabs.length === 1 ? theme.catacombs.tabUnitSingular : theme.catacombs.tabUnitPlural;

            return (
              <div
                key={sess.id}
                className="p-2 bg-rpg-dark-gray/80 border border-rpg-magic/40 rounded-sm shadow-pixel cursor-pointer"
                onClick={() => toggleSessionExpand(sess.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-sans text-[12.5px] text-rpg-magic truncate font-semibold flex items-center gap-1">
                      {isSponge ? (
                        <IconBubbles className="text-xs shrink-0" />
                      ) : (
                        <IconMagic className="text-xs shrink-0" />
                      )}
                      <span>{sess.title}</span>
                    </h4>
                    <p className="font-sans text-[10.5px] text-rpg-light-gray/80 mt-0.5">
                      Closed {formatRelativeTime(sess.timestamp)} • {sess.tabs.length} {tabUnit}
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => actions.resurrectSession(sess)}
                      className={theme.cls.btn.revive}
                      title="Reopen all tabs from this session in Chrome"
                    >
                      {isSponge ? <IconBurger className="text-xs shrink-0" /> : <IconRevive className="text-xs shrink-0" />}
                      <span>{theme.actions.resurrectSession}</span>
                    </button>
                    <button
                      onClick={() => actions.purgeSession(sess)}
                      className={theme.cls.btn.danger}
                      title="Permanently purge this session and its tabs"
                    >
                      {isSponge ? <IconFishBucket className="text-xs shrink-0" /> : <IconPurge className="text-xs shrink-0" />}
                      <span>{theme.actions.purgeSession}</span>
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="mt-2 pt-1.5 border-t border-rpg-border/60 space-y-1 pl-1">
                    {sess.tabs.map((tab) => (
                      <div
                        key={tab.cleanUrl}
                        className="flex items-center justify-between gap-2 p-1 hover:bg-rpg-surface rounded-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-xs text-slate-200 truncate" title={tab.title}>
                            • {tab.title || tab.domain}
                          </p>
                          <p className="font-sans text-[10px] text-rpg-light-gray/70 truncate" title={tab.url}>
                            {tab.url}
                          </p>
                        </div>
                        <button
                          onClick={() => actions.revive(tab)}
                          className={theme.cls.btn.revive}
                          title="Revive this tab into Chrome"
                        >
                          {isSponge ? <IconBurger className="text-[10px]" /> : <IconRevive className="text-[10px]" />}
                          <span>{theme.actions.revive}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
