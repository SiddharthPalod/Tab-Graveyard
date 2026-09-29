/**
 * src/App.tsx  — Root layout. Wires store → pages. Nothing else.
 * Pure presentation & routing wire. Zero business logic. Zero filtering algorithms.
 */
import React, { useState } from 'react';
import { useTabs } from './store/useTabs';
import { cls } from './ui/tokens';
import { Header }        from './ui/components/Header';
import { BattleNav, ActivePage } from './ui/components/BattleNav';
import { SearchBar }     from './ui/components/SearchBar';
import { Footer }        from './ui/components/Footer';
import { GraveyardPage } from './ui/pages/GraveyardPage';
import { CatacombsPage } from './ui/pages/CatacombsPage';
import { LivingPage }    from './ui/pages/LivingPage';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('graveyard');
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);

  const {
    filteredBuriedTabs,
    filteredLivingTabs,
    allBuriedTabs,
    allLivingTabs,
    filteredTombstones,
    filteredTemporalSessions,
    tombstones,
    temporalSessions,
    archetypes,
    topDomains,
    graveyardTopics,
    graveyardStats,
    filters,
    activeFilterCount,
    hasActiveFilters,
    keepCount,
    cremateCount,
    levelInfo,
    latestAwakening,
    loading,
    actions,
  } = useTabs();

  return (
    <div className={cls.shell}>
      {/* Top Dialog / System Header (Compact & with Level info) */}
      <Header
        buriedCount={allBuriedTabs.length}
        livingCount={allLivingTabs.length}
        awakeningMessage={latestAwakening}
        levelInfo={levelInfo}
      />

      {/* Main Navigation (Sleek Horizontal Segmented Control) */}
      <BattleNav
        activePage={activePage}
        onSelectPage={setActivePage}
        buriedCount={allBuriedTabs.length}
        tombstoneCount={tombstones.length + temporalSessions.length}
        livingCount={allLivingTabs.length}
      />
      
      {/* Search & Filters (Clean, unnested) */}
      <SearchBar
        filters={filters}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onChangeFilters={actions.setFilter}
        onResetFilters={actions.resetFilters}
        availableDomains={topDomains}
      />

      {/* Main Content Area (Unnested, maximum vertical space for tabs) */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pt-1">
        {activePage === 'graveyard' && (
          <GraveyardPage
            tabs={filteredBuriedTabs}
            searchQuery={filters.query || ''}
            loading={loading}
            hoveredUrl={hoveredUrl}
            onHover={setHoveredUrl}
            keepCount={keepCount}
            cremateCount={cremateCount}
            totalDead={allBuriedTabs.length}
            topics={graveyardTopics}
            stats={graveyardStats}
            actions={actions}
          />
        )}

        {activePage === 'catacombs' && (
          <CatacombsPage
            tombstones={filteredTombstones}
            temporalSessions={filteredTemporalSessions}
            searchQuery={filters.query || ''}
            loading={loading}
            actions={actions}
          />
        )}

        {activePage === 'living' && (
          <LivingPage
            tabs={filteredLivingTabs}
            archetypes={archetypes}
            searchQuery={filters.query || ''}
            loading={loading}
            hoveredUrl={hoveredUrl}
            onHover={setHoveredUrl}
            actions={actions}
          />
        )}
      </main>

      {/* Bottom Status / Tools */}
      <Footer
        activePage={activePage}
        hasBuried={allBuriedTabs.length > 0}
        hasLiving={allLivingTabs.length > 0}
        hasTombstones={tombstones.length > 0}
        onReviveAll={actions.resurrectAll}
        onSimulateAging={actions.simulateAging}
      />
    </div>
  );
};
