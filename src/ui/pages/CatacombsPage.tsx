import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '../../core/lifecycle';
import type { TombstoneRecord, TombstoneTabItem } from '../../core/db';
import { type TemporalSession, getSessionHash } from '../../core/sessionUtils';
import type { TabActions } from '../../store/useTabs';
import { TypewriterText } from '../components/RPGPrimitives';
import { useTheme } from '../themes/useTheme';
import { useSmartAI } from '../hooks/useSmartAI';

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
    | 'convertSessionToTombstone'
    | 'renameTombstone'
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
  const {
    isAiAvailable,
    sessionTitles,
    loadingSessions,
    enhanceSessionTitle,
    manuallyRenameSession,
  } = useSmartAI();

  const EmptyCatacombsIcon = theme.icons.emptyCatacombs;
  const VaultIcon = theme.icons.vault;
  const TemporalIcon = theme.icons.temporal;
  const ReviveIcon = theme.icons.revive;
  const PurgeIcon = theme.icons.purge;

  // Track which tombstones and sessions are expanded in UI
  const [expandedIds, setExpandedIds]               = useState<Record<string, boolean>>({});
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({});

  // Inline rename state for both permanent tombstones and temporal sessions
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim()) {
      setEditingId(null);
      return;
    }
    if (editingId.startsWith('tomb_')) {
      const tombId = editingId.slice('tomb_'.length);
      await actions.renameTombstone(tombId, editTitle.trim());
    } else if (editingId.startsWith('sess_')) {
      const sessId = editingId.slice('sess_'.length);
      const sess = temporalSessions.find((s) => s.id === sessId);
      if (sess) {
        await manuallyRenameSession(sess, editTitle.trim());
      }
    }
    setEditingId(null);
  };

  // Auto-enhance the most recent temporal session on opening (hits persistent cache first)
  useEffect(() => {
    if (isAiAvailable && temporalSessions.length > 0) {
      enhanceSessionTitle(temporalSessions[0]);
    }
  }, [isAiAvailable, temporalSessions, enhanceSessionTitle]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessionIds((prev) => {
      const next = !prev[id];
      if (next && isAiAvailable) {
        const target = temporalSessions.find((s) => s.id === id);
        if (target) enhanceSessionTitle(target);
      }
      return { ...prev, [id]: next };
    });
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
          <EmptyCatacombsIcon className="text-4xl text-rpg-yellow" />
        </div>
        <p className="text-rpg-white font-sans text-xs">
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
            <VaultIcon className="text-xs text-rpg-yellow" />
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
            const cleanTombTitle = (tomb.title || '').replace(/\s*\(\d+\s*tabs?\)\s*$/i, '');

            return (
              <div key={tomb.id} className="p-2 bg-rpg-dark-gray/80 border border-rpg-border rounded-sm shadow-pixel cursor-pointer"
              onClick={() => toggleExpand(tomb.id)}
              >
                {/* Tombstone Header Row: Full width title */}
                <div className="flex items-center justify-between gap-2 mb-1.5"> 
                  {editingId === 'tomb_' + tomb.id ? (
                    <div
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 min-w-0 bg-rpg-bg border border-rpg-yellow px-1.5 py-0.5 text-xs text-rpg-white outline-none font-sans"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className={theme.cls.btn.revive}
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={theme.cls.btn.subtle}
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1 text-rpg-yellow">
                      <VaultIcon className="text-sm shrink-0" />
                      <h3 className="font-sans text-[11px] truncate font-semibold text-rpg-white" title={cleanTombTitle}>
                        {cleanTombTitle}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId('tomb_' + tomb.id);
                          setEditTitle(cleanTombTitle);
                        }}
                        className="opacity-50 hover:opacity-100 text-[10px] text-rpg-light-gray hover:text-rpg-yellow transition-opacity p-0.5 cursor-pointer shrink-0"
                        title="Rename monument"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  <span className="font-pixel text-[7.5px] text-rpg-light-gray shrink-0 px-1 py-0.5 bg-rpg-bg border border-rpg-border">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>

                {/* Subtext & Action Buttons Row */}
                <div className="flex items-center justify-between pt-1.5 border-t border-rpg-border/60">
                  <p className="font-sans text-[9.5px] text-rpg-light-gray/80 truncate max-w-[210px]">
                    Collapsed {formatRelativeTime(tomb.createdAt)} • {tabCount} {unitLabel}
                  </p>

                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => actions.resurrectTombstone(tomb)} 
                      className={theme.cls.btn.revive}
                      title="Reopen all tabs from this monument in Chrome"
                    >
                      <ReviveIcon className="text-xs" />
                      <span>{theme.actions.resurrectSession}</span>
                    </button>
                    <button
                      onClick={() => actions.shatterTombstone(tomb.id)}
                      className={theme.cls.btn.danger}
                      title="Permanently shatter this monument"
                    >
                      <PurgeIcon className="text-xs" />
                      <span>{theme.actions.purgeSession}</span>
                    </button>
                  </div>
                </div>

                {/* Toggle URL list */}
                {isExpanded && (
                  <div className="mt-2 pt-1.5 border-t border-rpg-border/60 space-y-1 pl-2 border-l border-rpg-border">
                    {tomb.tabs.map((tab: TombstoneTabItem) => (
                      <div
                        key={tab.cleanUrl}
                        className="flex items-center justify-between gap-2 p-1 hover:bg-rpg-surface rounded-none"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-xs text-rpg-white truncate" title={tab.title}>
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
                          <ReviveIcon className="text-[10px]" />
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

      {/* ── Temporal Sessions (Mass Extinctions / Window Restores) ── */}
      {temporalSessions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <TemporalIcon className="text-xs text-rpg-magic" />
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
            const sessHash = getSessionHash(sess.tabs);
            const aiData = sessionTitles[sess.id] || sessionTitles[sessHash];
            const displayTitle = (aiData?.title || sess.title || '').replace(/\s*\(\d+\s*tabs?\)\s*$/i, '');
            const isAi = aiData?.isAi ?? false;
            const isLoading = (loadingSessions[sess.id] || loadingSessions[sessHash]) ?? false;

            return (
              <div
                key={sess.id}
                className="p-2 bg-rpg-dark-gray/80 border border-rpg-magic/40 rounded-sm shadow-pixel cursor-pointer"
                onClick={() => toggleSessionExpand(sess.id)}
              >
                {/* Header Row: Full Width Title */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {editingId === 'sess_' + sess.id ? (
                    <div
                      className="flex items-center gap-1.5 flex-1 min-w-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 min-w-0 bg-rpg-bg border border-rpg-magic px-1.5 py-0.5 text-xs text-rpg-white outline-none font-sans"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className={theme.cls.btn.revive}
                      >
                        SAVE
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={theme.cls.btn.subtle}
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <TemporalIcon className="text-xs text-rpg-magic shrink-0" />
                      <h4 className="font-sans text-[11px] text-rpg-magic truncate font-semibold" title={displayTitle}>
                        {displayTitle}
                      </h4>
                      {isAi && (
                        <span className="text-rpg-yellow text-[9px] shrink-0 font-sans font-bold" title="Smart AI Title (Gemini Nano)">✨ AI</span>
                      )}
                      {isLoading && (
                        <span className="text-[9px] text-rpg-light-gray animate-pulse shrink-0">✨ thinking...</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId('sess_' + sess.id);
                          setEditTitle(displayTitle);
                        }}
                        className="opacity-50 hover:opacity-100 text-[10px] text-rpg-light-gray hover:text-rpg-yellow transition-opacity p-0.5 cursor-pointer shrink-0"
                        title="Rename session"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  {/* Right Header Controls: +TOMB and Expand Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => actions.convertSessionToTombstone(sess, displayTitle)}
                      className="font-pixel text-[7.5px] px-1.5 py-0.5 text-rpg-yellow hover:text-rpg-white bg-rpg-surface hover:bg-rpg-surface/80 border border-rpg-yellow/50 rounded-none cursor-pointer transition-colors"
                      title="Move this temporary session to Permanent Tombstones"
                    >
                      +TOMB
                    </button>
                    <span
                      onClick={() => toggleSessionExpand(sess.id)}
                      className="font-pixel text-[7.5px] text-rpg-light-gray px-1 py-0.5 bg-rpg-bg border border-rpg-border cursor-pointer"
                    >
                      {isExp ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Subtext & Action Buttons Row */}
                <div className="flex items-center justify-between pt-1.5 border-t border-rpg-border/60">
                  <p className="font-sans text-[9.5px] text-rpg-light-gray/80 truncate max-w-[210px]">
                    Closed {formatRelativeTime(sess.timestamp)} • {sess.tabs.length} {tabUnit}
                  </p>

                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => actions.resurrectSession(sess)}
                      className={theme.cls.btn.revive}
                      title="Reopen all tabs from this session in Chrome"
                    >
                      <ReviveIcon className="text-xs shrink-0" />
                      <span>{theme.actions.resurrectSession}</span>
                    </button>
                    <button
                      onClick={() => actions.purgeSession(sess)}
                      className={theme.cls.btn.danger}
                      title="Permanently purge this session and its tabs"
                    >
                      <PurgeIcon className="text-xs shrink-0" />
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
                          <p className="font-sans text-xs text-rpg-white truncate" title={tab.title}>
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
                          <ReviveIcon className="text-[10px]" />
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
