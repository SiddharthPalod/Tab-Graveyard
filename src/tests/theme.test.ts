// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { THEMES, getTheme, DEFAULT_THEME_ID } from '../ui/themes';
import { undertaleTheme } from '../ui/themes/undertale';
import { spongebobTheme } from '../ui/themes/spongebob';
import { academiaTheme } from '../ui/themes/academia';
import { cyberpunkTheme } from '../ui/themes/cyberpunk';
import { corporateTheme } from '../ui/themes/corporate';
import { ThemeProvider } from '../ui/themes/useTheme';
import { Header } from '../ui/components/Header';
import { BattleNav } from '../ui/components/BattleNav';
import { TabItem } from '../ui/components/TabItem';
import { BehavioralMirror } from '../ui/components/BehavioralMirror';
import { TabViewModel } from '../core/behavior';
import { cls, STATUS_LABELS, QUOTES } from '../ui/tokens';

const mockTab: TabViewModel = {
  cleanUrl: 'https://krustykrab.com/menu',
  url: 'https://krustykrab.com/menu',
  title: 'Secret Krabby Patty Formula',
  domain: 'krustykrab.com',
  status: 'dead',
  openedAt: Date.now() - 10000,
  lastActivatedAt: Date.now() - 5000,
  totalActiveTime: 12000,
  activationCount: 4,
  daysInactive: 1,
  archetype: 'zombie',
  metamorphosis: {
    status: 'zombie',
    title: 'ZOMBIE',
    flavor: 'Test flavor',
    badgeCls: 'test-badge',
    icon: '🧟',
  },
};

const mockActions: any = {
  revive: () => Promise.resolve(),
  purge: () => Promise.resolve(),
  sweep: () => Promise.resolve(),
  sweepByArchetype: () => Promise.resolve(),
  collapseArchetypeToTombstone: () => Promise.resolve(),
};

describe('Theme Engine & Registry Tests', () => {
  it('has undertale, spongebob, academia, cyberpunk, and corporate themes registered', () => {
    expect(THEMES.undertale).toBeDefined();
    expect(THEMES.spongebob).toBeDefined();
    expect(THEMES.academia).toBeDefined();
    expect(THEMES.cyberpunk).toBeDefined();
    expect(THEMES.corporate).toBeDefined();
    expect(DEFAULT_THEME_ID).toBe('undertale');
  });

  it('safely resolves theme by id and falls back on invalid id', () => {
    expect(getTheme('undertale').id).toBe('undertale');
    expect(getTheme('spongebob').id).toBe('spongebob');
    expect(getTheme('academia').id).toBe('academia');
    expect(getTheme('cyberpunk').id).toBe('cyberpunk');
    expect(getTheme('corporate').id).toBe('corporate');
    expect(getTheme('non_existent').id).toBe('undertale');
    expect(getTheme(null).id).toBe('undertale');
  });

  it('each theme provides its own distinctive, cohesive typography configuration', () => {
    expect(undertaleTheme.fonts?.pixel).toContain('Press Start 2P');
    expect(spongebobTheme.fonts?.pixel).toContain('Titan One');
    expect(academiaTheme.fonts?.pixel).toContain('MedievalSharp');
    expect(cyberpunkTheme.fonts?.pixel).toContain('Orbitron');
    expect(corporateTheme.fonts?.pixel).toContain('Inter');

    // All themes preserve original clean Inter font for body/lists
    expect(undertaleTheme.fonts?.sans).toContain('Inter');
    expect(spongebobTheme.fonts?.sans).toContain('Inter');
    expect(academiaTheme.fonts?.sans).toContain('Inter');
    expect(cyberpunkTheme.fonts?.sans).toContain('Inter');
    expect(corporateTheme.fonts?.sans).toContain('Inter');
  });

  it('undertale theme has complete metadata, archetypes, and quote generators', () => {
    expect(undertaleTheme.name).toContain('Undertale');
    expect(undertaleTheme.statusLabels.alive).toContain('ALIVE');
    expect(undertaleTheme.statusLabels.dead).toContain('BURIED');
    expect(undertaleTheme.archetypes.zombie.name).toBe('ZOMBIE');
    expect(undertaleTheme.archetypes.phantom.name).toBe('PHANTOM');

    // Dynamic quote tests
    const emptyQuote = undertaleTheme.header.getQuote({ buriedCount: 0, livingCount: 2 });
    expect(emptyQuote).toContain('peace reigns');

    const buriedQuote = undertaleTheme.header.getQuote({ buriedCount: 5, livingCount: 2 });
    expect(buriedQuote).toContain('DETERMINATION');

    const highRamQuote = undertaleTheme.header.getQuote({ buriedCount: 0, livingCount: 25 });
    expect(highRamQuote).toContain('RAM weeps');
  });

  it('spongebob theme contains all main characters and short snappy labels', () => {
    expect(spongebobTheme.name).toBe('Bikini Bottom');
    expect(spongebobTheme.characters).toBeDefined();

    const charNames = spongebobTheme.characters?.map((c) => c.name) || [];
    expect(charNames).toContain('SpongeBob SquarePants');
    expect(charNames).toContain('Patrick Star');
    expect(charNames).toContain('Squidward Tentacles');
    expect(charNames).toContain('Mr. Eugene H. Krabs');
    expect(charNames).toContain('Sheldon J. Plankton');
    expect(charNames).toContain('Gary the Snail');
    expect(charNames).toContain('Sandy Cheeks');
    expect(charNames).toContain('French Narrator');

    // Short status labels
    expect(spongebobTheme.statusLabels.alive).toBe('★ READY');
    expect(spongebobTheme.statusLabels.aging).toBe('☁ SQUID');
    expect(spongebobTheme.statusLabels.forgotten).toBe('⚓ BARNACLE');
    expect(spongebobTheme.statusLabels.dead).toBe('☠ SUNK');

    // Short action buttons for compact extension layout
    expect(spongebobTheme.actions.revive).toBe('REVIVE');
    expect(spongebobTheme.actions.purge).toBe('CHUM');
    expect(spongebobTheme.actions.sweep).toBe('NET');
    expect(spongebobTheme.actions.cremate(5)).toBe('CHUM (5)');

    // Themed archetypes
    expect(spongebobTheme.archetypes.zombie.name).toBe('ANCHOVY');
    expect(spongebobTheme.archetypes.artifact.name).toBe('FORMULA');
    expect(spongebobTheme.archetypes.phantom.name).toBe('BARNACLE');
    expect(spongebobTheme.mirrorTitle).toBe('CREW PROFILES');
  });

  it('spongebob theme header quotes adapt to characters and situations', () => {
    const defaultQuote = spongebobTheme.header.getQuote({ buriedCount: 0, livingCount: 2 });
    expect(defaultQuote).toContain('French Narrator');

    const highLivingQuote = spongebobTheme.header.getQuote({ buriedCount: 0, livingCount: 20 });
    expect(highLivingQuote).toContain('Squidward');

    const lotsBuriedQuote = spongebobTheme.header.getQuote({ buriedCount: 45, livingCount: 2 });
    expect(lotsBuriedQuote).toContain('Mr. Krabs');

    const someBuriedQuote = spongebobTheme.header.getQuote({ buriedCount: 15, livingCount: 2 });
    expect(someBuriedQuote).toContain('Patrick');

    const fewBuriedQuote = spongebobTheme.header.getQuote({ buriedCount: 3, livingCount: 2 });
    expect(fewBuriedQuote).toContain('SpongeBob');
  });

  it('spongebob theme level titles reflect compact Bikini Bottom career progression', () => {
    expect(spongebobTheme.header.levelTitle(1, 'Novice')).toBe('Dishwasher');
    expect(spongebobTheme.header.levelTitle(2, 'Apprentice')).toBe('Fry Cook');
    expect(spongebobTheme.header.levelTitle(3, 'Journeyman')).toBe('Spatula Master');
    expect(spongebobTheme.header.levelTitle(7, 'Legend')).toBe('Formula Guard');
  });

  it('academia theme has complete metadata, gothic library archetypes, quotes, and level titles', () => {
    expect(academiaTheme.name).toBe('Gothic Library');
    expect(academiaTheme.shortName).toBe('OXFORD');
    expect(academiaTheme.icon).toBe('🏛️');

    // Labels & archetypes
    expect(academiaTheme.statusLabels.alive).toBe('✦ OPEN');
    expect(academiaTheme.statusLabels.dead).toBe('❦ SHELVED');
    expect(academiaTheme.archetypes.artifact.name).toBe('CODEX');
    expect(academiaTheme.archetypes.spark.name).toBe('THESIS');
    expect(academiaTheme.archetypes.mayfly.name).toBe('FOOTNOTE');
    expect(academiaTheme.archetypes.phantom.name).toBe('GLOSSA');

    // Navigation and actions
    expect(academiaTheme.nav.graveyard.label).toBe('STACKS');
    expect(academiaTheme.nav.catacombs.label).toBe('CODICES');
    expect(academiaTheme.nav.living.label).toBe('DESK');
    expect(academiaTheme.actions.revive).toBe('RETRIEVE');
    expect(academiaTheme.actions.purge).toBe('DISCARD');
    expect(academiaTheme.actions.sweep).toBe('SHELVE');
    expect(academiaTheme.actions.erect).toBe('BIND');

    // Quotes and levels
    expect(academiaTheme.quotes.determination(10)).toContain('ERUDITION');
    expect(academiaTheme.header.levelTitle(1, 'Novice')).toBe('Scribe');
    expect(academiaTheme.header.levelTitle(8, 'Chancellor')).toBe('Chancellor');
  });

  it('renders UI components dynamically with Gothic Library theme without any component changes', () => {
    const headerHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'academia' },
        React.createElement(Header, {
          buriedCount: 8,
          livingCount: 3,
          levelInfo: { level: 4, title: 'Archivist', currentXp: 30, nextLevelXp: 50, progress: 60 },
        })
      )
    );
    expect(headerHtml).toContain('OXFORD');
    expect(headerHtml).toContain('Archivist');

    const navHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'academia' },
        React.createElement(BattleNav, {
          activePage: 'graveyard',
          onSelectPage: () => {},
          buriedCount: 8,
          tombstoneCount: 2,
          livingCount: 3,
        })
      )
    );
    expect(navHtml).toContain('STACKS');
    expect(navHtml).toContain('CODICES');
    expect(navHtml).toContain('DESK');

    const tabHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'academia' },
        React.createElement(TabItem, {
          tab: mockTab,
          isHovered: false,
          onHover: () => {},
          actions: mockActions,
        })
      )
    );
    expect(tabHtml).toContain('RETRIEVE');
    expect(tabHtml).toContain('DISCARD');
    expect(tabHtml).toContain('Shelved');
  });

  it('tokens.ts maintains backward compatibility for legacy imports', () => {
    expect(cls).toBeDefined();
    expect(cls.shell).toBeDefined();
    expect(STATUS_LABELS.alive).toBe('♥ ALIVE');
    expect(QUOTES.clean).toContain('peace reigns');
  });

  it('renders UI components dynamically with SpongeBob light theme and visible level title', () => {
    const spongebobHeader = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'spongebob' },
        React.createElement(Header, {
          buriedCount: 5,
          livingCount: 2,
          levelInfo: { level: 9, title: 'Master', currentXp: 40, nextLevelXp: 50, progress: 80 },
        })
      )
    );

    expect(spongebobHeader).toContain('BIKINI');
    // Verify level title is NOT hidden by responsive breakpoint
    expect(spongebobHeader).toContain("Neptune&#x27;s Chef");
    expect(spongebobHeader).not.toContain('hidden sm:inline');

    const navHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'spongebob' },
        React.createElement(BattleNav, {
          activePage: 'graveyard',
          onSelectPage: () => {},
          buriedCount: 5,
          tombstoneCount: 2,
          livingCount: 10,
        })
      )
    );

    // Short navigation labels
    expect(navHtml).toContain('LOCKER');
    expect(navHtml).toContain('VAULT');
    expect(navHtml).toContain('FIELDS');

    const tabHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'spongebob' },
        React.createElement(TabItem, {
          tab: mockTab,
          isHovered: false,
          onHover: () => {},
          actions: mockActions,
        })
      )
    );

    expect(tabHtml).toContain('REVIVE');
    expect(tabHtml).toContain('CHUM');
    expect(tabHtml).toContain('ANCHOVY');
    expect(tabHtml).toContain('☠ SUNK');

    const mirrorHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'spongebob' },
        React.createElement(BehavioralMirror, {
          archetypes: {
            phantom: [],
            zombie: [mockTab],
            artifact: [],
            mayfly: [],
            grimoire: [],
            abyss: [],
            hoard: [],
            spark: [],
          },
          actions: mockActions,
        })
      )
    );

    expect(mirrorHtml).toContain('CREW PROFILES');
  });

  it('dynamically registers new themes and exposes them in getAvailableThemes and ThemeSelector', () => {
    const customOfficeTheme = {
      ...undertaleTheme,
      id: 'office',
      name: 'The Office',
      shortName: 'OFFICE',
      tagline: 'Identity theft is not a joke, Jim!',
      icon: '💼',
    };

    // Dynamically register the new theme
    THEMES['office'] = customOfficeTheme;

    expect(getTheme('office').name).toBe('The Office');
    expect(THEMES.office.shortName).toBe('OFFICE');

    const headerWithOffice = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'office' },
        React.createElement(Header, {
          buriedCount: 0,
          livingCount: 5,
        })
      )
    );

    // Dropdown trigger displays custom theme's icon and short name
    expect(headerWithOffice).toContain('💼');
    expect(headerWithOffice).toContain('OFFICE');

    // Clean up test theme
    delete THEMES.office;
  });

  it('cyberpunk theme has complete metadata, neo-grid archetypes, quotes, and level progression', () => {
    expect(cyberpunkTheme.name).toBe('Neo Arcade');
    expect(cyberpunkTheme.shortName).toBe('CYBER');
    expect(cyberpunkTheme.icon).toBe('👾');

    // Labels & archetypes
    expect(cyberpunkTheme.statusLabels.alive).toBe('⚡ LIVE');
    expect(cyberpunkTheme.statusLabels.dead).toBe('☠ DUMP');
    expect(cyberpunkTheme.archetypes.zombie.name).toBe('MALWARE');
    expect(cyberpunkTheme.archetypes.phantom.name).toBe('GLITCH');
    expect(cyberpunkTheme.archetypes.artifact.name).toBe('DATA-CORE');
    expect(cyberpunkTheme.archetypes.spark.name).toBe('OVERCLOCK');

    // Navigation and actions
    expect(cyberpunkTheme.nav.graveyard.label).toBe('SCRAP');
    expect(cyberpunkTheme.nav.catacombs.label).toBe('ICE VAULT');
    expect(cyberpunkTheme.nav.living.label).toBe('SYNAPSE');
    expect(cyberpunkTheme.actions.revive).toBe('BOOT');
    expect(cyberpunkTheme.actions.purge).toBe('DELETE');
    expect(cyberpunkTheme.actions.sweep).toBe('ICE');
    expect(cyberpunkTheme.actions.erect).toBe('ENCRYPT');

    // Quotes and levels
    expect(cyberpunkTheme.quotes.determination(15)).toContain('OVERCLOCK');
    expect(cyberpunkTheme.header.levelTitle(1, 'Novice')).toBe('Script Kiddie');
    expect(cyberpunkTheme.header.levelTitle(8, 'Deity')).toBe('AI Deity');
  });

  it('renders UI components dynamically with Cyberpunk theme without any component changes', () => {
    const navHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'cyberpunk' },
        React.createElement(BattleNav, {
          activePage: 'graveyard',
          onSelectPage: () => {},
          buriedCount: 7,
          tombstoneCount: 3,
          livingCount: 12,
        })
      )
    );
    expect(navHtml).toContain('SCRAP');
    expect(navHtml).toContain('ICE VAULT');
    expect(navHtml).toContain('SYNAPSE');

    const tabHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'cyberpunk' },
        React.createElement(TabItem, {
          tab: mockTab,
          isHovered: false,
          onHover: () => {},
          actions: mockActions,
        })
      )
    );
    expect(tabHtml).toContain('BOOT');
    expect(tabHtml).toContain('DELETE');
    expect(tabHtml).toContain('Flatlined');
  });

  it('corporate theme has clean persona-free metadata, labels, and professional terminology', () => {
    expect(corporateTheme.name).toBe('Corporate / Clean');
    expect(corporateTheme.shortName).toBe('WORKSPACE');
    expect(corporateTheme.icon).toBe('📁');

    // Persona-free status labels
    expect(corporateTheme.statusLabels.alive).toBe('OPEN');
    expect(corporateTheme.statusLabels.dead).toBe('CLOSED');
    expect(corporateTheme.statusLabels.aging).toBe('INACTIVE');
    expect(corporateTheme.statusLabels.forgotten).toBe('STALE');

    // Domain and navigation
    expect(corporateTheme.labels.stateDead).toBe('Closed');
    expect(corporateTheme.labels.stateAlive).toBe('Open');
    expect(corporateTheme.labels.collapseArchetype).toBe('SAVE TO FOLDER');
    expect(corporateTheme.nav.graveyard.label).toBe('CLOSED');
    expect(corporateTheme.nav.catacombs.label).toBe('FOLDERS');
    expect(corporateTheme.nav.living.label).toBe('OPEN');

    // Professional actions
    expect(corporateTheme.actions.revive).toBe('RESTORE');
    expect(corporateTheme.actions.purge).toBe('DELETE');
    expect(corporateTheme.actions.sweep).toBe('CLOSE');
    expect(corporateTheme.actions.erect).toBe('SAVE FOLDER');
    expect(corporateTheme.catacombs.tombstoneSectionTitle).toBe('SAVED FOLDERS');
    expect(corporateTheme.catacombs.temporalSectionTitle).toBe('CLOSED SESSIONS');

    // Professional quotes and level titles
    expect(corporateTheme.quotes.clean).toBe('Workspace clean. No open tabs.');
    expect(corporateTheme.quotes.emptyGraveyard).toBe('No closed tabs in history.');
    expect(corporateTheme.header.levelTitle(1, 'Novice')).toBe('Tier 1');
  });

  it('renders UI components dynamically with Corporate / Clean theme', () => {
    const navHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'corporate' },
        React.createElement(BattleNav, {
          activePage: 'graveyard',
          onSelectPage: () => {},
          buriedCount: 4,
          tombstoneCount: 2,
          livingCount: 6,
        })
      )
    );
    expect(navHtml).toContain('CLOSED');
    expect(navHtml).toContain('FOLDERS');
    expect(navHtml).toContain('OPEN');

    const tabHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'corporate' },
        React.createElement(TabItem, {
          tab: mockTab,
          isHovered: false,
          onHover: () => {},
          actions: mockActions,
        })
      )
    );
    expect(tabHtml).toContain('RESTORE');
    expect(tabHtml).toContain('DELETE');
  });

  it('renders all components and applies custom labels/icons for an arbitrary dynamic theme without any component code changes', () => {
    const customMatrixTheme = {
      ...undertaleTheme,
      id: 'matrix_grid',
      name: 'The Construct',
      shortName: 'MATRIX',
      tagline: 'Take the red pill.',
      icon: '🕶️',
      labels: {
        stateDead: 'Decompiled',
        stateAlive: 'Streaming',
        collapseArchetype: 'TO MAINFRAME',
      },
      nav: {
        graveyard: { label: 'TRASH', tooltip: 'Decompiled memory buffer' },
        catacombs: { label: 'CORE', tooltip: 'Encrypted mainframe cores' },
        living:    { label: 'SOCKETS', tooltip: 'Active network sockets' },
      },
    };

    THEMES['matrix_grid'] = customMatrixTheme;

    const navHtml = renderToString(
      React.createElement(
        ThemeProvider,
        { initialThemeId: 'matrix_grid' },
        React.createElement(BattleNav, {
          activePage: 'graveyard',
          onSelectPage: () => {},
          buriedCount: 4,
          tombstoneCount: 1,
          livingCount: 8,
        })
      )
    );
    expect(navHtml).toContain('TRASH');
    expect(navHtml).toContain('CORE');
    expect(navHtml).toContain('SOCKETS');

    delete THEMES.matrix_grid;
  });

  it('persistThemePreference writes across localStorage, chrome.storage.sync, and chrome.storage.local', async () => {
    const { persistThemePreference } = await import('../ui/themes/useTheme');

    // Mock chrome storage for the test environment
    const fakeSync: Record<string, any> = {};
    const fakeLocal: Record<string, any> = {};
    (globalThis as any).chrome = {
      storage: {
        sync: {
          set: (obj: any) => Object.assign(fakeSync, obj),
          get: (keys: string[], cb: Function) => cb(fakeSync),
        },
        local: {
          set: (obj: any) => Object.assign(fakeLocal, obj),
          get: (keys: string[], cb: Function) => cb(fakeLocal),
        },
      },
    };

    localStorage.clear();
    await persistThemePreference('spongebob');

    // 1. Verify synchronous localStorage write (instant frame-0 load)
    expect(localStorage.getItem('tabGraveyardTheme')).toBe('spongebob');

    // 2. Verify chrome.storage.sync write (survives rebuilds, updates, and cross-device sync)
    expect(fakeSync['tabGraveyardTheme']).toBe('spongebob');

    // 3. Verify chrome.storage.local write
    expect(fakeLocal['tabGraveyardTheme']).toBe('spongebob');
  });
});

