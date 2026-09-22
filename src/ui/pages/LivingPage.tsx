import React, { useState } from 'react';
import { cls, QUOTES } from '../tokens';
import { TabItem } from '../components/TabItem';
import type { TabRecord } from '../../core/db';
import type { TabActions } from '../../store/useTabs';

interface LivingPageProps {
  tabs:        TabRecord[];
  searchQuery: string;
  loading:     boolean;
  hoveredUrl:  string | null;
  onHover:     (url: string | null) => void;
  actions:     Pick<TabActions, 'revive' | 'purge' | 'sweep' | 'collapseToTombstone'>;
}

export const LivingPage: React.FC<LivingPageProps> = ({
  tabs,
  searchQuery,
  loading,
  hoveredUrl,
  onHover,
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
        <p className="text-2xl">👻</p>
        <p className="font-dialogue text-[15px]">
          {searchQuery ? QUOTES.noResults : QUOTES.emptyLiving}
        </p>
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
  const targetTabs   = hasSelection ? selectedTabs : tabs;

  const handleSelectAll = () => {
    if (hasSelection) {
      setSelectedUrls({});
    } else {
      const all: Record<string, boolean> = {};
      tabs.forEach((t) => { all[t.cleanUrl] = true; });
      setSelectedUrls(all);
    }
  };

  const handleConfirmCollapse = async () => {
    await actions.collapseToTombstone(targetTabs, customTitle);
    setSelectedUrls({});
    setCustomTitle('');
    setNamingOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Catacombs Collapse Action Bar */}
      <div className={`${cls.card} p-1.5 mb-1.5 bg-black/60`}>
        {namingOpen ? (
          <div className="space-y-1">
            <p className="font-pixel text-[7.5px] text-ut-lv">
              * NAME THIS TOMBSTONE ({targetTabs.length} URLs):
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
                onClick={handleConfirmCollapse}
                className={`${cls.btn.battle} text-[7.5px] px-1.5 py-1 border-ut-lv text-ut-lv`}
              >
                [BURY]
              </button>
              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[7.5px] text-zinc-400 hover:text-white px-1"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1">
            <button
              onClick={handleSelectAll}
              className="font-pixel text-[7.5px] text-zinc-400 hover:text-ut-lv"
            >
              {hasSelection ? `[DESELECT (${selectedTabs.length})]` : '[SELECT ALL]'}
            </button>

            <button
              onClick={() => setNamingOpen(true)}
              className={`${cls.btn.battle} text-[7.5px] px-2 py-0.5 border-ut-orange text-ut-orange hover:border-ut-lv hover:text-ut-lv`}
              title="Collapse and free RAM in Chrome"
            >
              🪦 {hasSelection ? `COLLAPSE (${selectedTabs.length})` : `COLLAPSE ALL (${tabs.length})`}
            </button>
          </div>
        )}
      </div>

      {/* List of Living Tabs */}
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
