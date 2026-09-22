import React, { useState } from 'react';
import { QUOTES } from '../tokens';
import { TabItem } from '../components/TabItem';
import { BehavioralMirror } from '../components/BehavioralMirror';
import type { TabArchetype, TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { DialogueBox, PixelPanel, PixelButton, TypewriterText } from '../components/RPGPrimitives';
import { IconGhost, IconErect } from '../components/GameIcons';

interface LivingPageProps {
  tabs:        TabViewModel[];
  archetypes:  Record<TabArchetype, TabViewModel[]>;
  searchQuery: string;
  loading:     boolean;
  hoveredUrl:  string | null;
  onHover:     (url: string | null) => void;
  actions:     Pick<
    TabActions,
    | 'revive'
    | 'purge'
    | 'sweep'
    | 'collapseToTombstone'
    | 'sweepByArchetype'
    | 'collapseArchetypeToTombstone'
  >;
}

export const LivingPage: React.FC<LivingPageProps> = ({
  tabs,
  archetypes,
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
      <DialogueBox className="text-center text-rpg-yellow">
        <TypewriterText text={QUOTES.checkingDust} />
      </DialogueBox>
    );
  }

  if (tabs.length === 0) {
    return (
      <DialogueBox className="text-center space-y-2">
        <div className="flex justify-center text-rpg-mid-gray">
          <IconGhost className="text-4xl" />
        </div>
        <p className="text-rpg-white">
          <TypewriterText text={searchQuery ? QUOTES.noResults : QUOTES.emptyLiving} />
        </p>
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
      {/* The Behavioral Mirror — Psychological Archetypes & Sweeps */}
      <BehavioralMirror archetypes={archetypes} actions={actions} />

      {/* Catacombs Collapse Action Bar */}
      <PixelPanel className="p-2 mb-2 !border-rpg-white !bg-rpg-bg">
        {namingOpen ? (
          <div className="space-y-2">
            <p className="font-pixel text-[8px] text-rpg-yellow">
              * NAME THIS TOMBSTONE ({targetTabs.length} URLs):
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
              <PixelButton onClick={handleConfirmCollapse} className="gap-1 flex items-center">
                <IconErect />
                <span>[BURY]</span>
              </PixelButton>
              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[8px] text-rpg-mid-gray hover:text-rpg-white px-1"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleSelectAll}
              className="font-pixel text-[8px] text-rpg-light-gray hover:text-rpg-yellow"
            >
              {hasSelection ? `[DESELECT (${selectedTabs.length})]` : '[SELECT ALL]'}
            </button>

            <PixelButton
              onClick={() => setNamingOpen(true)}
              className="!border-rpg-yellow !text-rpg-yellow hover:!bg-rpg-yellow hover:!text-rpg-bg gap-1 flex items-center"
              title="Collapse and free RAM in Chrome"
            >
              <IconErect />
              <span>{hasSelection ? `COLLAPSE (${selectedTabs.length})` : `COLLAPSE ALL (${tabs.length})`}</span>
            </PixelButton>
          </div>
        )}
      </PixelPanel>

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
