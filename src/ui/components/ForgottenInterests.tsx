/**
 * src/ui/components/ForgottenInterests.tsx
 *
 * Phase 8: Graveyard Topics & Local Statistics Component.
 * Automatically displays extracted keyword clusters from buried tabs,
 * allowing users to rediscover their forgotten rabbit holes, inspect local stats,
 * and collapse entire topics into permanent Catacomb monuments.
 */

import React, { useState } from 'react';
import type { TopicCluster, GraveyardLocalStats } from '../../core/topicUtils';
import type { TabActions } from '../../store/useTabs';
import type { TabRecord } from '../../core/db';
import type { TabViewModel } from '../../core/behavior';
import { formatActiveDuration } from '../../core/lifecycle';
import { IconBrain, IconErect, IconSearch } from './GameIcons';
import { useSmartAI } from '../hooks/useSmartAI';
import { useTheme } from '../themes/useTheme';

interface ForgottenInterestsProps {
  topics:   TopicCluster[];
  stats:    GraveyardLocalStats;
  actions:  Pick<TabActions, 'collapseTopicToTombstone' | 'setFilter'>;
  allBuriedTabs?: (TabRecord | TabViewModel)[];
}

export const ForgottenInterests: React.FC<ForgottenInterestsProps> = ({
  topics,
  stats,
  actions,
  allBuriedTabs,
}) => {
  const { theme } = useTheme();
  const { isAiAvailable, smartTopics, isLoadingTopics, enhanceTopics, removeSmartTopic } = useSmartAI();
  const [filterMode, setFilterMode] = useState<'all' | 'smart' | 'keyword'>('all');

  const smartList = (smartTopics || []).map((t) => ({ ...t, isAi: true }));
  const keywordList = (topics || []).map((t) => ({ ...t, isAi: false }));
  const hasSmart = smartList.length > 0;

  // Retain all previous keyword topics alongside smart topics!
  const displayTopics =
    hasSmart && filterMode === 'smart'
      ? smartList
      : hasSmart && filterMode === 'keyword'
      ? keywordList
      : hasSmart
      ? [...smartList, ...keywordList]
      : keywordList;

  const [isOpen, setIsOpen]           = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showStats, setShowStats]     = useState(false);

  if (displayTopics.length === 0 && stats.totalBuried === 0) return null;

  const selectedTopic = displayTopics.find((t) => t.id === selectedTopicId) || null;

  const handleFilterTopic = (topic: TopicCluster) => {
    actions.setFilter({ query: topic.keywords[0] || topic.name });
  };

  const handleCollapseTopic = async (topic: TopicCluster) => {
    await actions.collapseTopicToTombstone(topic);
    if ((topic as any).isAi) {
      removeSmartTopic(topic.id);
    }
    setSelectedTopicId(null);
  };

  return (
    <div className="p-2 mb-1.5 bg-rpg-dark-gray/80 border border-rpg-magic/40 rounded-sm shadow-pixel">
      {/* ── Header / Toggle ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1.5 font-pixel text-[7.5px] text-rpg-magic py-0.5 hover:text-rpg-white min-w-0">
          <IconBrain className="text-xs shrink-0" />
          <span className="truncate">FORGOTTEN INTERESTS</span>
          <span className="text-rpg-light-gray/70 font-sans text-[10.5px] shrink-0">
            ({displayTopics.length} topics)
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isAiAvailable && allBuriedTabs && allBuriedTabs.length >= 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                enhanceTopics(allBuriedTabs as TabRecord[]);
              }}
              disabled={isLoadingTopics}
              className="font-pixel text-[6.5px] bg-rpg-bg hover:bg-rpg-surface text-rpg-yellow border border-rpg-yellow/60 px-1.5 py-0.5 rounded-none flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title={hasSmart ? 'Re-cluster topics with Gemini Nano' : 'Cluster topics semantically using Chrome Gemini Nano'}
            >
              <span>✨</span>
              <span>{isLoadingTopics ? 'CLUSTERING...' : hasSmart ? 'RE-CLUSTER' : 'AI CLUSTERS'}</span>
            </button>
          )}
          <div className="font-pixel text-[7.5px] text-rpg-light-gray hover:text-rpg-white px-1 py-0.5 bg-rpg-bg border border-rpg-border">
            {isOpen ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* ── Expanded Topic Dashboard ───────────────────────────────────── */}
      {isOpen && (
        <div className="mt-2 pt-2 border-t border-rpg-border/60 space-y-2">
          {showStats ? (
            /* ── Local Statistics Breakdown ────────────────────────────── */
            <div className="p-2 bg-rpg-surface/80 border border-rpg-border rounded-none space-y-1.5 font-sans text-[11px]">
              <div className="flex items-center justify-between font-pixel text-[7.5px] text-rpg-yellow border-b border-rpg-border pb-1">
                <span>GRAVEYARD TELEMETRY & STATS</span>
                <span>LOCAL ONLY</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-rpg-white pt-0.5">
                <div>
                  <span className="text-rpg-light-gray block text-[10px]">Total Buried Tabs:</span>
                  <span className="font-semibold text-rpg-white">{stats.totalBuried} tabs</span>
                </div>
                <div>
                  <span className="text-rpg-light-gray block text-[10px]">Total Focus Reading:</span>
                  <span className="font-semibold text-rpg-white">{formatActiveDuration(stats.totalActiveTime)}</span>
                </div>
                <div>
                  <span className="text-rpg-light-gray block text-[10px]">Top Dead Domain:</span>
                  <span className="font-semibold text-rpg-magic truncate block">{stats.topDomain || 'None'}</span>
                </div>
                <div>
                  <span className="text-rpg-light-gray block text-[10px]">Avg Dormancy:</span>
                  <span className="font-semibold text-rpg-white">{stats.avgDormancyDays} days</span>
                </div>
              </div>

              {stats.topTopic && (
                <div className="pt-1 border-t border-rpg-border/50 text-[10.5px]">
                  <span className="text-rpg-light-gray">Dominant Forgotten Obsession: </span>
                  <span className="text-rpg-yellow font-medium">{stats.topTopic}</span>
                </div>
              )}
            </div>
          ) : (
            /* ── Topic Clusters ────────────────────────────────────────── */
            <>
              {/* Optional Filter View Pills when Smart Topics exist */}
              {hasSmart && (
                <div className="flex items-center gap-1 font-pixel text-[6.5px] pb-1 border-b border-rpg-border/40">
                  <span className="text-rpg-light-gray">VIEW:</span>
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-1 py-0.5 border cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-rpg-surface border-rpg-magic text-rpg-magic font-bold'
                        : 'border-rpg-border text-rpg-light-gray hover:text-rpg-white'
                    }`}
                  >
                    ALL ({smartList.length + keywordList.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('smart')}
                    className={`px-1 py-0.5 border cursor-pointer ${
                      filterMode === 'smart'
                        ? 'bg-rpg-surface border-rpg-magic text-rpg-magic font-bold'
                        : 'border-rpg-border text-rpg-light-gray hover:text-rpg-white'
                    }`}
                  >
                    ✨ SMART ({smartList.length})
                  </button>
                  <button
                    onClick={() => setFilterMode('keyword')}
                    className={`px-1 py-0.5 border cursor-pointer ${
                      filterMode === 'keyword'
                        ? 'bg-rpg-surface border-rpg-magic text-rpg-magic font-bold'
                        : 'border-rpg-border text-rpg-light-gray hover:text-rpg-white'
                    }`}
                  >
                    KEYWORDS ({keywordList.length})
                  </button>
                </div>
              )}

              {displayTopics.length === 0 ? (
                <p className="font-sans text-xs text-rpg-light-gray text-center py-1">
                  * Close more tabs to detect forgotten interest clusters.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {displayTopics.map((topic) => {
                    const isSel = selectedTopicId === topic.id;
                    const isAiTopic = (topic as any).isAi ?? false;

                    return (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedTopicId(isSel ? null : topic.id)}
                        className={`font-pixel text-[7px] px-1.5 py-0.5 border transition-colors flex items-center gap-1 cursor-pointer rounded-none ${
                          isSel
                            ? 'border-rpg-magic text-rpg-magic bg-rpg-surface font-bold shadow-pixel'
                            : 'border-rpg-border text-rpg-light-gray hover:border-rpg-magic hover:text-rpg-white hover:bg-rpg-surface/60'
                        }`}
                      >
                        <span>{topic.icon}</span>
                        <span>{topic.name}</span>
                        <span className="text-rpg-magic">
                          ({topic.count})
                        </span>
                        {isAiTopic && (
                          <span className="text-[7.5px] text-rpg-yellow" title="Smart AI Cluster">✨</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected Topic Insight & Quick Actions */}
              {selectedTopic && (
                <div className="p-2 bg-rpg-surface/80 border border-rpg-border space-y-1.5 rounded-none">
                  <div className="flex items-center justify-between">
                    <span className="font-pixel text-[7.5px] text-rpg-magic flex items-center gap-1">
                      <span>{selectedTopic.icon}</span>
                      <span>{selectedTopic.name} ({selectedTopic.count} tabs)</span>
                    </span>
                    <span className="font-sans text-[10px] text-rpg-light-gray">
                      Focus: {formatActiveDuration(selectedTopic.totalActiveTime)}
                    </span>
                  </div>

                  <p className="font-sans text-[10.5px] text-rpg-white/90">
                    <span className="text-rpg-light-gray">Keywords: </span>
                    {selectedTopic.keywords.map((k) => `#${k}`).join(' ')}
                  </p>

                  {/* One-click solid action buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-rpg-border/60">
                    <button
                      onClick={() => handleFilterTopic(selectedTopic)}
                      className={theme.cls.btn.subtle}
                      title="Filter Graveyard tabs matching this topic"
                    >
                      <IconSearch className="text-xs" />
                      <span>FILTER TABS</span>
                    </button>
                    <button
                      onClick={() => handleCollapseTopic(selectedTopic)}
                      className={theme.cls.btn.accent}
                      title="Bundle all tabs in this topic into a permanent Tombstone in Catacombs"
                    >
                      <IconErect className="text-xs" />
                      <span>{theme.actions.erect}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
