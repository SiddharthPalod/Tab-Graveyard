// @vitest-environment happy-dom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { THEMES, getTheme, DEFAULT_THEME_ID } from '../ui/themes';
import { undertaleTheme } from '../ui/themes/undertale';
import { spongebobTheme } from '../ui/themes/spongebob';
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
  it('has both undertale and spongebob themes registered', () => {
    expect(THEMES.undertale).toBeDefined();
    expect(THEMES.spongebob).toBeDefined();
    expect(DEFAULT_THEME_ID).toBe('undertale');
  });

  it('safely resolves theme by id and falls back on invalid id', () => {
    expect(getTheme('undertale').id).toBe('undertale');
    expect(getTheme('spongebob').id).toBe('spongebob');
    expect(getTheme('non_existent').id).toBe('undertale');
    expect(getTheme(null).id).toBe('undertale');
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

  it('renders all components and applies custom labels/icons for an arbitrary 3rd theme without any component code changes', () => {
    const customCyberTheme = {
      ...undertaleTheme,
      id: 'cyberpunk',
      name: 'Night City',
      shortName: 'CYBER',
      tagline: 'Wake up, Samurai.',
      icon: '⚡',
      labels: {
        stateDead: 'Flatlined',
        stateAlive: 'Netrunning',
        collapseArchetype: 'TO ICE VAULT',
      },
      nav: {
        graveyard: { label: 'SCRAP', tooltip: 'Flatlined neural links' },
        catacombs: { label: 'ARCHIVE', tooltip: 'Deep freeze ICE vaults' },
        living:    { label: 'SYNAPSE', tooltip: 'Active neural synapses' },
      },
    };

    THEMES['cyberpunk'] = customCyberTheme;

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
    expect(navHtml).toContain('ARCHIVE');
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
    // Custom domain label rendered without modifying TabItem!
    expect(tabHtml).toContain('Flatlined');

    delete THEMES.cyberpunk;
  });
});

