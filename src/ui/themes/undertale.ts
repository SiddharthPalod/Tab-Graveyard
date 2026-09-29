import { ThemePersonality } from './types';

export const undertaleTheme: ThemePersonality = {
  id: 'undertale',
  name: 'Undertale Graveyard',
  shortName: 'GRAVE',
  tagline: 'Fills you with determination',
  icon: '💀',

  header: {
    title: 'GRAVEYARD',
    subtitle: 'Underground Tab Necropolis',
    levelTitle: (_level, defaultTitle) => defaultTitle,
    getQuote: ({ buriedCount, livingCount, awakeningMessage }) => {
      if (awakeningMessage) {
        return `* ${awakeningMessage}`;
      }
      if (livingCount >= 18) {
        return `* The dead are restless. Your RAM weeps with ${livingCount} open tabs.`;
      }
      if (buriedCount > 30) {
        return `* A vast sea of ${buriedCount} souls sleeps beneath the soil.`;
      }
      if (buriedCount > 10) {
        return `* Restless spirits wander. ${buriedCount} tabs laid to rest.`;
      }
      if (buriedCount > 0) {
        return `* Seeing ${buriedCount} buried tabs fills you with DETERMINATION.`;
      }
      return '* The graveyard is quiet... peace reigns.';
    },
  },

  nav: {
    graveyard: { label: 'GRAVE', tooltip: 'Buried Tabs in Graveyard' },
    catacombs: { label: 'TOMBS', tooltip: 'Tombstones & Temporal Sessions' },
    living:    { label: 'LIVING', tooltip: 'Active living tabs in Chrome' },
  },

  statusLabels: {
    alive:     '♥ ALIVE',
    aging:     '♦ DUST',
    forgotten: '♠ COBWEB',
    dead:      '♣ BURIED',
  },

  mirrorTitle: 'BEHAVIORAL MIRROR',
  archetypes: {
    phantom: {
      id:          'phantom',
      icon:        '👻',
      name:        'PHANTOM',
      quote:       '* Opened with noble intentions. Instantly forgotten.',
      description: 'Viewed < 15s total. You just wanted to save the link.',
      badgeCls:    'text-zinc-400 border-zinc-500',
    },
    zombie: {
      id:          'zombie',
      icon:        '🧟',
      name:        'ZOMBIE',
      quote:       '* Clicked out of pure reflex just to verify it is still alive.',
      description: 'Visited 3+ times, but < 10s per visit. Never actually read.',
      badgeCls:    'text-green-400 border-green-500',
    },
    artifact: {
      id:          'artifact',
      icon:        '🏺',
      name:        'ARTIFACT',
      quote:       '* A monument to a quest completed long ago. Let it rest.',
      description: 'Spent 20+ mins here in the past, but untouched for 3+ days.',
      badgeCls:    'text-amber-400 border-amber-500',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '⏳',
      name:        'MAYFLY',
      quote:       '* Born for a single fleeting inquiry. It served you well.',
      description: 'Search results or auth redirect, single visit, idle for hours.',
      badgeCls:    'text-cyan-400 border-cyan-500',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '📜',
      name:        'GRIMOIRE',
      quote:       '* Consulted in times of dire errors, then left open forever.',
      description: 'Documentation or developer references kept as safety blankets.',
      badgeCls:    'text-purple-400 border-purple-500',
    },
    abyss: {
      id:          'abyss',
      icon:        '🕳️',
      name:        'ABYSS',
      quote:       '* A dark vortex that consumed your afternoon DETERMINATION.',
      description: 'Endless feeds and video streams with heavy engagement.',
      badgeCls:    'text-rose-400 border-rose-500',
    },
    hoard: {
      id:          'hoard',
      icon:        '🛒',
      name:        'HOARD',
      quote:       '* Items waiting for a discount that will never arrive.',
      description: 'Shopping carts and price comparisons dormant for days.',
      badgeCls:    'text-orange-400 border-orange-500',
    },
    spark: {
      id:          'spark',
      icon:        '⚡',
      name:        'SPARK',
      quote:       '* Burning bright with genuine current DETERMINATION.',
      description: 'Active workhorse currently being read or edited.',
      badgeCls:    'text-yellow-300 border-yellow-400',
    },
  },

  quotes: {
    determination: (n: number) =>
      `* Seeing ${n} buried tabs fills you with DETERMINATION.`,
    clean:          '* The graveyard is quiet... peace reigns.',
    emptyGraveyard: '* The ruins are silent. No tabs buried yet.',
    emptyLiving:    '* No active tabs detected in the underground.',
    emptyCatacombs: '* The catacombs are quiet. No tombstones erected.',
    noResults:      '* But nobody came.',
    hintBuried:     '* (Close any tab in Chrome to banish it here.)',
    hintCatacombs:  '* (Collapse tabs from LIVING to store entire sessions here.)',
    checkingDust:   '* (Checking the dust...)',
  },

  actions: {
    revive:           'REVIVE',
    reviveTooltip:    'Revive tab back into active Chrome window',
    purge:            'PURGE',
    purgeTooltip:     'Permanently remove from Graveyard',
    sweep:            'SWEEP',
    sweepTooltip:     'Close tab in Chrome and bury into Graveyard',
    erect:            'ERECT',
    erectAction:      (n) => `ERECT (${n})`,
    bury:             'BURY',
    collapse:         (n) => `COLLAPSE (${n})`,
    collapseAll:      (n) => `COLLAPSE ALL (${n})`,
    cremate:          (n) => `CREMATE (${n})`,
    keepLabel:        'KEEP:',
    keepTooltip:      'Number of newest dead tabs to keep',
    selectAll:        '[SELECT ALL]',
    deselect:         (n) => `[DESELECT (${n})]`,
    resurrectSession: 'RESURRECT',
    purgeSession:     'PURGE',
    reviveAll:        'REVIVE ALL',
    simulateDev:      '[DEV: +4 DAYS]',
    footerResting:    '* SESSIONS RESTING',
    footerLocal:      '* ALL LOCAL DB',
  },

  catacombs: {
    tombstoneSectionTitle:   'PERMANENT TOMBSTONES',
    tombstoneMonumentsLabel: (n) => `(${n} monuments)`,
    temporalSectionTitle:    'TEMPORAL SESSIONS',
    temporalBadge:           '(Auto-grouped)',
    tabUnitSingular:         'tab',
    tabUnitPlural:           'tabs',
    nameTombstonePrompt:     (n) => `* NAME THIS TOMBSTONE (${n} GRAVES):`,
    placeholderTombstone:    'auto-name (leave blank) or type title...',
  },

  cls: {
    shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',
    box:   'border border-rpg-border bg-rpg-dark-gray/95 shadow-pixel rounded-sm',
    card:  'border border-rpg-border bg-rpg-dark-gray/90 hover:bg-rpg-surface hover:border-rpg-light-gray/40 transition-all rounded-sm shadow-pixel',
    btn: {
      revive: 'font-pixel text-[8px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      danger: 'font-pixel text-[8px] bg-rose-900/90 hover:bg-rose-700 text-rose-100 border border-rose-500/40 px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      sweep:  'font-pixel text-[8px] bg-indigo-950 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      subtle: 'font-pixel text-[8px] bg-rpg-surface hover:bg-rpg-surface-hover text-rpg-light-gray hover:text-rpg-white border border-rpg-border px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
      accent: 'font-pixel text-[8px] bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-pixel',
    },
    badge: {
      alive:     'text-rpg-heart border-rpg-heart/40 bg-rpg-heart/10',
      aging:     'text-rpg-yellow border-rpg-yellow/40 bg-rpg-yellow/10',
      forgotten: 'text-rpg-determination border-rpg-determination/40 bg-rpg-determination/10',
      dead:      'text-rpg-light-gray border-rpg-border bg-rpg-surface',
    },
    badgeBase: 'font-pixel text-[7px] border px-1 py-0.5 rounded-none whitespace-nowrap',
    text: {
      pixel:    'font-pixel',
      dialogue: 'font-dialogue text-base leading-snug',
      sans:     'font-sans text-xs',
      muted:    'text-rpg-light-gray',
      label:    'font-pixel text-[8px] text-rpg-yellow tracking-wider',
    },
  },

  characters: [
    {
      name: 'Sans',
      role: 'Sentry',
      quote: 'take it easy. you got a lot of tabs on your plate.',
      icon: '💀',
    },
    {
      name: 'Papyrus',
      role: 'Royal Guard Hopeful',
      quote: 'NYEH HEH HEH! I, THE GREAT PAPYRUS, SHALL ORGANIZE ALL TABS!',
      icon: '🦴',
    },
    {
      name: 'Toriel',
      role: 'Caretaker of Ruins',
      quote: 'Be good, my child. Do not open more tabs than your machine can bear.',
      icon: '🥧',
    },
  ],
};
