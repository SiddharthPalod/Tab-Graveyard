import React, { useState } from 'react';
import { QUOTES } from '../tokens';
import { TabItem } from '../components/TabItem';
import type { TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { DialogueBox, PixelButton, TypewriterText, PixelPanel } from '../components/RPGPrimitives';
import { IconSkull, IconErect, IconCremate } from '../components/GameIcons';

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
      <DialogueBox className="text-center text-rpg-yellow">
        <TypewriterText text={QUOTES.checkingDust} />
      </DialogueBox>
    );
  }

  if (tabs.length === 0) {
    return (
      <DialogueBox className="text-center space-y-2">
        <div className="flex justify-center text-rpg-mid-gray">
          <IconSkull className="text-4xl" />
        </div>
        <p className="text-rpg-white">
          <TypewriterText text={searchQuery ? QUOTES.noResults : QUOTES.emptyGraveyard} />
        </p>
        {!searchQuery && <p className="text-sm text-rpg-mid-gray">{QUOTES.hintBuried}</p>}
      </DialogueBox>
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
      <PixelPanel className="p-2 mb-2 !border-rpg-white !bg-rpg-bg">
        {namingOpen ? (
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-rpg-yellow">
              * NAME THIS TOMBSTONE ({selectedTabs.length} GRAVES):
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="auto-name (leave blank) or type title..."
                className="flex-1 bg-rpg-dark-gray border-2 border-rpg-white font-dialogue text-base px-2 py-1 text-rpg-white outline-none placeholder:text-rpg-mid-gray"
                autoFocus
              />
              <PixelButton onClick={handleConfirmBundle} className="gap-1 flex items-center">
                <IconErect />
                <span>[ERECT]</span>
              </PixelButton>
              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[8px] text-rpg-mid-gray hover:text-rpg-white px-1 cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Left: Selection / Tombstone Bundle */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="font-pixel text-[8px] text-rpg-light-gray hover:text-rpg-yellow cursor-pointer"
              >
                {hasSelection ? `[DESELECT (${selectedTabs.length})]` : '[SELECT ALL]'}
              </button>

              {hasSelection && (
                <PixelButton
                  onClick={() => setNamingOpen(true)}
                  className="!border-rpg-yellow !text-rpg-yellow hover:!bg-rpg-yellow hover:!text-rpg-bg gap-1 flex items-center"
                  title="Bundle selected dead tabs into a permanent Tombstone in Catacombs"
                >
                  <IconErect />
                  <span>ERECT ({selectedTabs.length})</span>
                </PixelButton>
              )}
            </div>

            {/* Right: User-Configurable Cremation */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-pixel text-[8px] text-rpg-mid-gray">KEEP:</span>
              <input
                type="number"
                min="0"
                max="500"
                value={keepCount}
                onChange={(e) => actions.setKeepCount(parseInt(e.target.value, 10))}
                className="w-10 bg-rpg-dark-gray border-2 border-rpg-mid-gray font-pixel text-[8px] text-center text-rpg-yellow py-1 outline-none"
                title="Number of newest dead tabs to keep"
              />
              <PixelButton
                onClick={handleCremate}
                disabled={cremateCount === 0}
                className={`flex items-center gap-1 !border-rpg-soul !text-rpg-soul ${
                  cremateCount === 0 ? 'opacity-40 cursor-not-allowed shadow-none' : 'hover:!bg-rpg-soul hover:!text-rpg-bg shadow-[2px_2px_0_#555555]'
                }`}
                title={`Keep the newest ${keepCount} tabs, delete the oldest ${cremateCount} tabs (${cremateCount}/${totalDead})`}
              >
                <IconCremate />
                <span>CREMATE ({cremateCount}/{totalDead})</span>
              </PixelButton>
            </div>
          </div>
        )}
      </PixelPanel>

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
