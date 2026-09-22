import React, { useState } from 'react';
import { cls, QUOTES } from '../tokens';
import { TabItem } from '../components/TabItem';
import type { TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';

interface GraveyardPageProps {
  tabs:         TabViewModel[];
  searchQuery:  string;
  loading:      boolean;
  hoveredUrl:   string | null;
  onHover:      (url: string | null) => void;
  keepCount:    number;
  cremateCount: number;
  totalDead:    number;
  actions:      Pick<
    TabActions,
    'revive' | 'purge' | 'sweep' | 'bundleGravesToTombstone' | 'cremateOldest' | 'setKeepCount'
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
  actions,
}) => {
  const [selectedUrls, setSelectedUrls] = useState<Record<string, boolean>>({});
  const [namingOpen, setNamingOpen]     = useState(false);
  const [customTitle, setCustomTitle]   = useState('');

  if (loading) {
    return (
      <div className={`${cls.box} p-5 text-center font-dialogue text-[15px] text-ut-lv`}>
        {QUOTES.checkingDust}
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className={`${cls.box} p-5 text-center space-y-1.5`}>
        <p className="text-2xl">💔</p>
        <p className="font-dialogue text-[15px]">
          {searchQuery ? QUOTES.noResults : QUOTES.emptyGraveyard}
        </p>
        {!searchQuery && <p className="font-dialogue text-xs text-zinc-400">{QUOTES.hintBuried}</p>}
      </div>
    );
  }

  const toggleSelect = (cleanUrl: string) => {
    setSelectedUrls((prev) => ({
      ...prev,
      [cleanUrl]: !prev[cleanUrl],
    }));
  };

  const selectedTabs = tabs.filter((t) => selectedUrls[t.cleanUrl]);
  const hasSelection = selectedTabs.length > 0;

  const handleSelectAll = () => {
    if (hasSelection) {
      setSelectedUrls({});
    } else {
      const all: Record<string, boolean> = {};
      tabs.forEach((t) => { all[t.cleanUrl] = true; });
      setSelectedUrls(all);
    }
  };

  const handleConfirmBundle = async () => {
    await actions.bundleGravesToTombstone(selectedTabs, customTitle);
    setSelectedUrls({});
    setCustomTitle('');
    setNamingOpen(false);
  };

  const handleCremate = async () => {
    if (cremateCount <= 0) return;
    await actions.cremateOldest(keepCount);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Action & Cleanup Bar */}
      <div className={`${cls.card} p-1.5 mb-1.5 bg-black/60`}>
        {namingOpen ? (
          <div className="space-y-1">
            <p className="font-pixel text-[7.5px] text-ut-lv">
              * NAME THIS TOMBSTONE ({selectedTabs.length} GRAVES):
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="auto-name (leave blank) or type title..."
                className="flex-1 bg-black border border-ut-text font-dialogue text-sm px-1.5 py-0.5 text-ut-text outline-none placeholder:text-zinc-600"
                autoFocus
              />
              <button
                onClick={handleConfirmBundle}
                className={`${cls.btn.battle} text-[7.5px] px-1.5 py-1 border-ut-lv text-ut-lv`}
              >
                [ERECT]
              </button>
              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[7.5px] text-zinc-400 hover:text-white px-1 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1 flex-wrap">
            {/* Left: Selection / Tombstone Bundle */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSelectAll}
                className="font-pixel text-[7.5px] text-zinc-400 hover:text-ut-lv cursor-pointer"
              >
                {hasSelection ? `[DESELECT (${selectedTabs.length})]` : '[SELECT ALL]'}
              </button>

              {hasSelection && (
                <button
                  onClick={() => setNamingOpen(true)}
                  className={`${cls.btn.battle} text-[7.5px] px-1.5 py-0.5 border-ut-lv text-ut-lv`}
                  title="Bundle selected dead tabs into a permanent Tombstone in Catacombs"
                >
                  🪦 ERECT TOMBSTONE ({selectedTabs.length})
                </button>
              )}
            </div>

            {/* Right: User-Configurable Cremation */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-pixel text-[7px] text-zinc-400">KEEP:</span>
              <input
                type="number"
                min="0"
                max="500"
                value={keepCount}
                onChange={(e) => actions.setKeepCount(parseInt(e.target.value, 10))}
                className="w-8 bg-black border border-ut-muted font-pixel text-[7.5px] text-center text-ut-lv py-0.5 outline-none"
                title="Number of newest dead tabs to keep"
              />
              <button
                onClick={handleCremate}
                disabled={cremateCount === 0}
                className={`${cls.btn.danger} text-[7.5px] px-1.5 py-0.5 ${
                  cremateCount === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-red-600 hover:text-white'
                }`}
                title={`Keep the newest ${keepCount} tabs, delete the oldest ${cremateCount} tabs (${cremateCount}/${totalDead})`}
              >
                🔥 CREMATE ({cremateCount}/{totalDead})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* List of Buried Tabs */}
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
