/**
 * src/App.tsx  — Root layout. Wires store → pages. Nothing else.
 * Neither a JS dev nor a UI dev needs to touch this unless adding a new page.
 */
import React, { useState, useMemo } from 'react';
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
  const [activePage,  setActivePage]  = useState<ActivePage>('graveyard');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredUrl,  setHoveredUrl]  = useState<string | null>(null);

  const {
    buriedTabs,
    livingTabs,
    tombstones,
    archetypes,
    temporalSessions,
    loading,
    actions,
  } = useTabs();

  const filter = (tabs: typeof buriedTabs) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tabs;
    return tabs.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      t.cleanUrl.includes(q),
    );
  };

  const filteredBuried = useMemo(() => filter(buriedTabs), [buriedTabs, searchQuery]);
  const filteredLiving = useMemo(() => filter(livingTabs), [livingTabs, searchQuery]);

  return (
    <div className={cls.shell}>
      <Header
        buriedCount={buriedTabs.length}
        livingCount={livingTabs.length}
        awakeningMessage={latestAwakening}
      />

      <BattleNav
        activePage={activePage}
        onSelectPage={setActivePage}
        buriedCount={buriedTabs.length}
        tombstoneCount={tombstones.length + temporalSessions.length}
        livingCount={livingTabs.length}
      />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {activePage === 'graveyard' && (
        <GraveyardPage
          tabs={filteredBuried}
          searchQuery={searchQuery}
          loading={loading}
          hoveredUrl={hoveredUrl}
          onHover={setHoveredUrl}
          actions={actions}
        />
      )}

      {activePage === 'catacombs' && (
        <CatacombsPage
          tombstones={tombstones}
          temporalSessions={temporalSessions}
          searchQuery={searchQuery}
          loading={loading}
          actions={actions}
        />
      )}

      {activePage === 'living' && (
        <LivingPage
          tabs={filteredLiving}
          archetypes={archetypes}
          searchQuery={searchQuery}
          loading={loading}
          hoveredUrl={hoveredUrl}
          onHover={setHoveredUrl}
          actions={actions}
        />
      )}

      <Footer
        activePage={activePage}
        hasBuried={buriedTabs.length > 0}
        hasLiving={livingTabs.length > 0}
        hasTombstones={tombstones.length > 0}
        onReviveAll={actions.resurrectAll}
        onSimulateAging={actions.simulateAging}
      />
    </div>
  );
};
