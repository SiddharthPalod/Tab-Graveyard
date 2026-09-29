import React from 'react';
import type { TabArchetype } from '../../core/behavior';

export type ThemeId = string;

export type IconComponent = React.ComponentType<{ className?: string; size?: number | string }>;

export interface ThemeCharacter {
  name: string;
  role: string;
  quote: string;
  icon?: string;
}

export interface ThemeArchetypeMeta {
  id:          TabArchetype;
  icon:        string;
  name:        string;
  quote:       string;
  description: string;
  badgeCls:    string;
}

export interface ThemeIcons {
  header:          IconComponent;
  counter:         IconComponent;
  navGraveyard:    IconComponent;
  navCatacombs:    IconComponent;
  navLiving:       IconComponent;
  revive:          IconComponent;
  purge:           IconComponent;
  sweep:           IconComponent;
  vault:           IconComponent;
  cremate:         IconComponent;
  temporal:        IconComponent;
  emptyGraveyard:  IconComponent;
  emptyCatacombs:  IconComponent;
  emptyLiving:     IconComponent;
  tabDeadHover:    IconComponent;
  tabAliveHover:   IconComponent;
}

export interface ThemePalette {
  bg:                  string;
  white:               string; // High-contrast primary text
  darkGray:            string; // Surface / card background
  surface:             string;
  surfaceHover:        string;
  border:              string;
  midGray:             string;
  lightGray:           string;
  soul:                string;
  determination:       string;
  monster:             string;
  magic:               string;
  heart:               string;
  yellow:              string;
  shadow?:             string;
  shadowHover?:        string;
  scrollbarTrack?:     string;
  scrollbarThumb?:     string;
  scrollbarThumbHover?: string;
}

export interface ThemeLabels {
  stateDead:         string; // e.g. "Buried" vs "Sunken"
  stateAlive:        string; // e.g. "Resting" vs "Swimming"
  collapseArchetype: string; // e.g. "TO TOMBSTONE" vs "TO VAULT"
}

export interface ThemePersonality {
  id:        ThemeId;
  name:      string;
  shortName: string;
  tagline:   string;
  icon:      string; // e.g. '💀' or '🧽'

  // Header presentation
  header: {
    title: string;
    subtitle: string;
    levelTitle: (level: number, defaultTitle: string) => string;
    getQuote: (ctx: {
      buriedCount: number;
      livingCount: number;
      awakeningMessage?: string;
    }) => string;
  };

  // Nav presentation
  nav: {
    graveyard: { label: string; tooltip: string };
    catacombs: { label: string; tooltip: string };
    living:    { label: string; tooltip: string };
  };

  // Status badges on tab items
  statusLabels: Record<'alive' | 'aging' | 'forgotten' | 'dead', string>;

  // Behavioral Archetypes
  mirrorTitle: string;
  archetypes:  Record<TabArchetype, ThemeArchetypeMeta>;

  // Theme icons - pure data-driven icons, zero hardcoding in components
  icons: ThemeIcons;

  // Theme palette - pure data-driven CSS variables, zero hardcoding in index.css
  palette: ThemePalette;

  // Theme domain labels
  labels: ThemeLabels;

  // Dynamic quotes & hints
  quotes: {
    determination:  (n: number) => string;
    clean:          string;
    emptyGraveyard: string;
    emptyLiving:    string;
    emptyCatacombs: string;
    noResults:      string;
    hintBuried:     string;
    hintCatacombs:  string;
    checkingDust:   string;
  };

  // Action button labels and tooltips
  actions: {
    revive:           string;
    reviveTooltip:    string;
    purge:            string;
    purgeTooltip:     string;
    sweep:            string;
    sweepTooltip:     string;
    erect:            string;
    erectAction:      (n: number) => string;
    bury:             string;
    collapse:         (n: number) => string;
    collapseAll:      (n: number) => string;
    cremate:          (n: number) => string;
    keepLabel:        string;
    keepTooltip:      string;
    selectAll:        string;
    deselect:         (n: number) => string;
    resurrectSession: string;
    purgeSession:     string;
    reviveAll:        string;
    simulateDev:      string;
    footerResting:    string;
    footerLocal:      string;
  };

  // Catacombs & Session sections
  catacombs: {
    tombstoneSectionTitle:   string;
    tombstoneMonumentsLabel: (n: number) => string;
    temporalSectionTitle:    string;
    temporalBadge:           string;
    tabUnitSingular:         string;
    tabUnitPlural:           string;
    nameTombstonePrompt:     (n: number) => string;
    placeholderTombstone:    string;
  };

  // Visual CSS classes
  cls: {
    shell: string;
    box:   string;
    card:  string;
    btn: {
      revive: string;
      danger: string;
      sweep:  string;
      subtle: string;
      accent: string;
    };
    badge: {
      alive:     string;
      aging:     string;
      forgotten: string;
      dead:      string;
    };
    badgeBase: string;
    text: {
      pixel:    string;
      dialogue: string;
      sans:     string;
      muted:    string;
      label:    string;
    };
  };

  // List of theme characters for flavor/Easter eggs
  characters?: ThemeCharacter[];
}
