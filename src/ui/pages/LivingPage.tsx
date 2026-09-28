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
      <div className="p-3 bg-rpg-dark-gray/90 border border-rpg-border text-center text-rpg-yellow font-dialogue text-base rounded-sm">
        <TypewriterText text={QUOTES.checkingDust} />
      </div>
    );
  }

  if (tabs.length === 0) {
    return (
      <div className="p-6 bg-rpg-dark-gray/80 border border-rpg-border text-center space-y-2 rounded-sm shadow-pixel">
        <div className="flex justify-center text-rpg-mid-gray">
          <IconGhost className="text-4xl" />
        </div>
        <p className="text-slate-200 font-sans text-xs">
          <TypewriterText text={searchQuery ? QUOTES.noResults : QUOTES.emptyLiving} />
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
      {/* The Behavioral Mirror — Psychological Archetypes & Sweeps */}
      <BehavioralMirror archetypes={archetypes} actions={actions} />

      {/* Catacombs Collapse Action Bar (Sleek fill over outline) */}
      <div className="p-1.5 mb-1.5 bg-rpg-dark-gray/80 border border-rpg-border rounded-sm">
        {namingOpen ? (
          <div className="space-y-1.5">
            <p className="font-pixel text-[7.5px] text-rpg-yellow">
              * NAME THIS TOMBSTONE ({targetTabs.length} URLs):
            </p>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="auto-name (leave blank) or type title..."
                className="flex-1 bg-rpg-bg border border-rpg-border font-sans text-xs px-2 py-1 text-rpg-white outline-none placeholder:text-rpg-mid-gray"
                autoFocus
              />
              <button 
                onClick={handleConfirmCollapse} 
                className="font-pixel text-[8px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2 py-1 inline-flex items-center gap-1 cursor-pointer"
              >
                <IconErect className="text-xs" />
                <span>BURY</span>
              </button>
              <button
                onClick={() => setNamingOpen(false)}
                className="font-pixel text-[7.5px] text-rpg-mid-gray hover:text-rpg-white px-1"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleSelectAll}
              className="font-pixel text-[7.5px] text-rpg-light-gray hover:text-rpg-yellow cursor-pointer"
            >
              {hasSelection ? `[DESELECT (${selectedTabs.length})]` : '[SELECT ALL]'}
            </button>

            <button
              onClick={() => setNamingOpen(true)}
              className="font-pixel text-[8px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2 py-1 inline-flex items-center gap-1 cursor-pointer transition-all shadow-pixel"
              title="Collapse open tabs in Chrome to free RAM"
            >
              <IconErect className="text-xs" />
              <span>{hasSelection ? `COLLAPSE (${selectedTabs.length})` : `COLLAPSE ALL (${tabs.length})`}</span>
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
