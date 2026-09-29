import React, { useState } from 'react';
import { TabItem } from '../components/TabItem';
import { ForgottenInterests } from '../components/ForgottenInterests';
import type { TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import type { TopicCluster, GraveyardLocalStats } from '../../core/topicUtils';
import { TypewriterText } from '../components/RPGPrimitives';
import {
  IconErect,
  IconCremate,
  IconGrave,
  IconPurge,
  IconAnchor,
  IconFishBucket,
  IconBurger,
} from '../components/GameIcons';
import { useTheme } from '../themes/useTheme';

interface GraveyardPageProps {
  tabs: TabViewModel[];
  searchQuery: string;
  loading: boolean;
  hoveredUrl: string | null;
  onHover: (url: string | null) => void;
  keepCount: number;
  cremateCount: number;
  totalDead: number;
  topics?: TopicCluster[];
  stats?: GraveyardLocalStats;
  actions: Pick<
    TabActions,
    | 'revive'
    | 'purge'
    | 'purgeSelected'
    | 'sweep'
    | 'bundleGravesToTombstone'
    | 'cremateOldest'
    | 'setKeepCount'
    | 'collapseTopicToTombstone'
    | 'setFilter'
  >;
}

export const GraveyardPage: React.FC<GraveyardPageProps> = ({
  tabs,
  searchQuery,
  loading,
  hoveredUrl,
  onHover,
  keepCount,
  cremateCount,
  totalDead,
  topics,
  stats,
  actions,
}) => {
  const { theme } = useTheme();
  const isSponge = theme.id === 'spongebob';

  const [selectedUrls, setSelectedUrls] = useState<Record<string, boolean>>({});
  const [namingOpen, setNamingOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  if (loading) {
    return (
      <div className="p-3 bg-rpg-dark-gray/90 border border-rpg-border text-center text-rpg-yellow font-dialogue text-base rounded-sm">
        <TypewriterText text={theme.quotes.checkingDust} />
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className="p-6 bg-rpg-dark-gray/80 border border-rpg-border text-center space-y-2 rounded-sm shadow-pixel">
        <div className="flex justify-center text-rpg-mid-gray">
          {isSponge ? (
            <IconAnchor className="text-4xl text-[#00A3E0]" />
          ) : (
            <IconGrave className="text-4xl text-rpg-mid-gray" />
          )}
        </div>

        <p className="text-slate-200 font-sans text-xs">
          <TypewriterText text={searchQuery ? theme.quotes.noResults : theme.quotes.emptyGraveyard} />
        </p>

        {!searchQuery && (
          <p className="text-[11px] text-rpg-light-gray font-sans">
            {theme.quotes.hintBuried}
          </p>
        )}
      </div>
    );
  }

  const toggleSelect = (cleanUrl: string) => {
    setSelectedUrls((prev) => ({
      ...prev,
      [cleanUrl]: !prev[cleanUrl],
    }));
  };

  const selectedTabs = tabs.filter((tab) => selectedUrls[tab.cleanUrl]);
  const hasSelection = selectedTabs.length > 0;

  const handleSelectAll = () => {
    if (hasSelection) {
      setSelectedUrls({});
      return;
    }

    const all: Record<string, boolean> = {};

    tabs.forEach((tab) => {
      all[tab.cleanUrl] = true;
    });

    setSelectedUrls(all);
  };

  const handleConfirmBundle = async () => {
    await actions.bundleGravesToTombstone(selectedTabs, customTitle);

    setSelectedUrls({});
    setCustomTitle('');
    setNamingOpen(false);
  };

  const handlePurgeSelected = async () => {
    if (selectedTabs.length === 0) return;

    await actions.purgeSelected(selectedTabs);
    setSelectedUrls({});
  };

  const handleCremate = async () => {
    if (cremateCount <= 0) return;

    await actions.cremateOldest(keepCount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {topics && stats && (
        <ForgottenInterests
          topics={topics}
          stats={stats}
          actions={actions}
        />
      )}

      {/* ========================================================
          TOP ACTION / CLEANUP BAR
          ======================================================== */}

      <div className="p-2.5 mb-2 bg-rpg-dark-gray/80 border border-rpg-border rounded-sm">
        {namingOpen ? (
          /* ====================================================
             NAME TOMBSTONE MODE
             ==================================================== */

          <div className="space-y-2">
            <p className="font-pixel text-[7.5px] text-rpg-yellow">
              {theme.catacombs.nameTombstonePrompt(selectedTabs.length)}
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={theme.catacombs.placeholderTombstone}
                className="flex-1 min-w-0 bg-rpg-bg border border-rpg-border font-sans text-xs px-2 py-1.5 text-rpg-white outline-none placeholder:text-rpg-mid-gray"
                autoFocus
              />

              <button
                onClick={handleConfirmBundle}
                className={theme.cls.btn.accent}
              >
                {isSponge ? <IconBurger className="text-xs shrink-0" /> : <IconErect className="text-xs shrink-0" />}
                <span>{theme.actions.erect}</span>
              </button>

              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[7.5px] text-rpg-mid-gray hover:text-rpg-white px-2 py-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          /* ====================================================
             NORMAL ACTION MODE
             ==================================================== */

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {/* ------------------------------------------------
                LEFT: SELECT / ERECT
                ------------------------------------------------ */}

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSelectAll}
                className="font-pixel text-[7.5px] text-rpg-light-gray hover:text-rpg-yellow cursor-pointer whitespace-nowrap"
              >
                {hasSelection ? theme.actions.deselect(selectedTabs.length) : theme.actions.selectAll}
              </button>

              {hasSelection && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNamingOpen(true)}
                    className={theme.cls.btn.accent}
                    title="Bundle selected dead tabs into a permanent vault/tombstone"
                  >
                    {isSponge ? <IconBurger className="text-xs shrink-0" /> : <IconErect className="text-xs shrink-0" />}
                    <span>{theme.actions.erectAction(selectedTabs.length)}</span>
                  </button>

                  <button
                    onClick={handlePurgeSelected}
                    className="font-pixel text-[8px] bg-rose-900/90 hover:bg-rose-700 text-rose-100 border border-rose-500/50 px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shrink-0 shadow-pixel"
                    title={theme.actions.purgeTooltip}
                  >
                    {isSponge ? <IconFishBucket className="text-xs shrink-0" /> : <IconPurge className="text-xs shrink-0" />}
                    <span>{theme.actions.purge} ({selectedTabs.length})</span>
                  </button>
                </div>
              )}
            </div>

            {/* ------------------------------------------------
                RIGHT: KEEP / CREMATE
                ------------------------------------------------ */}

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-pixel text-[7.5px] text-rpg-mid-gray whitespace-nowrap">
                {theme.actions.keepLabel}
              </span>

              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={keepCount}
                  onChange={(e) => actions.setKeepCount(parseInt(e.target.value, 10))}
                  className="w-12 h-8 bg-rpg-bg border border-rpg-border font-pixel text-[8px] leading-[1.5] text-center text-rpg-yellow outline-none shrink-0"
                  title={theme.actions.keepTooltip}
                />

                <button
                  type="button"
                  onClick={() => actions.setKeepCount(keepCount === 0 ? 20 : 0)}
                  className="font-pixel text-[7px] px-1.5 py-1 bg-rpg-bg border border-rpg-border hover:border-rpg-yellow text-rpg-yellow cursor-pointer shrink-0"
                  title={keepCount === 0 ? 'Reset KEEP to 20' : 'Set KEEP to 0 to cremate ALL dead tabs'}
                >
                  {keepCount === 0 ? 'RESET' : 'ALL'}
                </button>
              </div>

              <button
                onClick={handleCremate}
                disabled={cremateCount === 0}
                className={`font-pixel text-[8px] px-3 py-1.5 uppercase inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 transition-all ${cremateCount === 0 ? 'bg-rose-950/40 text-rose-300/40 border border-rose-950/40 cursor-not-allowed' : 'bg-rose-900/90 hover:bg-rose-700 text-rose-100 border border-rose-500/50 shadow-pixel cursor-pointer'}`}
                title={cremateCount === 0 ? `All ${totalDead} dead tabs are retained because KEEP is set to ${keepCount}. Click ALL or lower KEEP to 0 to cremate them.` : `Keep the newest ${keepCount} tabs, delete the oldest ${cremateCount} tabs (${cremateCount}/${totalDead})`}
              >
                {isSponge ? <IconFishBucket className="text-xs shrink-0" /> : <IconCremate className="text-xs shrink-0" />}
                <span>{theme.actions.cremate(cremateCount)}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          LIST OF BURIED TABS
          ======================================================== */}

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1">
        {tabs.map((tab) => (
          <TabItem
            key={tab.cleanUrl}
            tab={tab}
            isHovered={hoveredUrl === tab.cleanUrl}
            onHover={onHover}
            actions={actions}
            isSelected={Boolean(selectedUrls[tab.cleanUrl])}
            onToggleSelect={toggleSelect}
          />
        ))}
      </div>
    </div>
  );
};