import { ThemePersonality } from './types';

export const spongebobTheme: ThemePersonality = {
  id: 'spongebob',
  name: 'Bikini Bottom',
  shortName: 'BIKINI',
  tagline: "I'm Ready!",
  icon: '🧽',

  header: {
    title: 'BIKINI',
    subtitle: 'Krusty Krab Operations',
    levelTitle: (level, _defaultTitle) => {
      const titles = [
        'Dishwasher',          // LV1
        'Fry Cook',            // LV2
        'Spatula Master',      // LV3
        'Jelly Wrangler',      // LV4
        'Hall Monitor',        // LV5
        'Goofy Goober',        // LV6
        'Formula Guard',       // LV7
        "Neptune's Chef",      // LV8+
      ];
      const index = Math.max(0, Math.min(level - 1, titles.length - 1));
      return titles[index];
    },
    getQuote: ({ buriedCount, livingCount, awakeningMessage }) => {
      if (awakeningMessage) {
        return `* [French Narrator]: "${awakeningMessage}"`;
      }
      if (livingCount >= 18) {
        return `* [Squidward]: "${livingCount} tabs swimming?! My clarinet peace is ruined!"`;
      }
      if (buriedCount > 30) {
        return `* [Mr. Krabs]: "Over ${buriedCount} tabs sunk to Davy Jones! Look at all that RAM!"`;
      }
      if (buriedCount > 10) {
        return `* [Patrick]: "The inner machinations of me mind laid ${buriedCount} tabs to rest."`;
      }
      if (buriedCount > 0) {
        return `* [SpongeBob]: "${buriedCount} tabs saved safe! I'm ready! I'm ready!"`;
      }
      return '* [French Narrator]: "Ze seabed is clean and peaceful."';
    },
  },

  nav: {
    graveyard: { label: 'LOCKER', tooltip: "Davy Jones' Locker (Buried Tabs)" },
    catacombs: { label: 'VAULT', tooltip: 'Secret Formula Vault & Time Capsules' },
    living:    { label: 'FIELDS', tooltip: 'Jellyfish Fields (Active Swimming Tabs)' },
  },

  statusLabels: {
    alive:     '★ READY',
    aging:     '☁ SQUID',
    forgotten: '⚓ BARNACLE',
    dead:      '☠ SUNK',
  },

  mirrorTitle: 'CREW PROFILES',
  archetypes: {
    phantom: {
      id:          'phantom',
      icon:        '⚓',
      name:        'BARNACLE',
      quote:       '* Opened with noble intentions, then drifted away into the kelp.',
      description: 'Viewed < 15s total. Just an untouched sea sponge.',
      badgeCls:    'text-cyan-700 border-cyan-400 bg-cyan-50',
    },
    zombie: {
      id:          'zombie',
      icon:        '🐟',
      name:        'ANCHOVY',
      quote:       '* Clicked in a frantic rush! Meep meep meep!',
      description: 'Visited 3+ times, but < 10s each. Total sensory chaos.',
      badgeCls:    'text-blue-700 border-blue-400 bg-blue-50',
    },
    artifact: {
      id:          'artifact',
      icon:        '🍔',
      name:        'FORMULA',
      quote:       '* A legendary Krabby Patty secret formula. Keep it safe in the vault.',
      description: 'Heavy engagement in past, now dormant for 3+ days.',
      badgeCls:    'text-amber-800 border-amber-400 bg-amber-50',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '🫧',
      name:        'BUBBLE',
      quote:       '* A single fleeting inquiry, blown and popped.',
      description: 'Quick redirect or lookup, idle for hours.',
      badgeCls:    'text-sky-700 border-sky-400 bg-sky-50',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '📖',
      name:        'BOATING',
      quote:       '* Mrs. Puff\'s Boating manual consulted and left open forever.',
      description: 'Documentation and references kept as safety blankets.',
      badgeCls:    'text-indigo-700 border-indigo-400 bg-indigo-50',
    },
    abyss: {
      id:          'abyss',
      icon:        '🪼',
      name:        'ROCK BOTTOM',
      quote:       '* A dark, endless feed vortex deep down in Rock Bottom.',
      description: 'Endless feeds and video streams with heavy engagement.',
      badgeCls:    'text-purple-700 border-purple-400 bg-purple-50',
    },
    hoard: {
      id:          'hoard',
      icon:        '💰',
      name:        'KRABS DIME',
      quote:       '* Items waiting for a discount that will never arrive.',
      description: 'Shopping carts and price comparisons dormant for days.',
      badgeCls:    'text-emerald-700 border-emerald-400 bg-emerald-50',
    },
    spark: {
      id:          'spark',
      icon:        '🧽',
      name:        'READY SPARK',
      quote:       '* Burning bright with pure Fry Cook energy! I\'M READY!',
      description: 'Active workhorse currently being read or edited.',
      badgeCls:    'text-amber-700 border-yellow-400 bg-yellow-50',
    },
  },

  quotes: {
    determination: (n: number) =>
      `* Seeing ${n} tabs saved makes you shout: "I'M READY!"`,
    clean:          '* [French Narrator]: "Ze seabed is sparkling clean and peaceful."',
    emptyGraveyard: '* [Patrick]: "Is mayonnaise a tab? No tabs in Davy Jones\' locker."',
    emptyLiving:    '* [Squidward]: "Utter silence. Not a single open tab to ruin my solo."',
    emptyCatacombs: '* [Mr. Krabs]: "Me safe is empty! No formulas locked yet!"',
    noResults:      '* [Plankton]: "Foiled again! Zero tabs found in Bikini Bottom!"',
    hintBuried:     '* (Close any Chrome tab to cast it down to Davy Jones.)',
    hintCatacombs:  '* (Bundle tabs from FIELDS to lock formulas into the vault.)',
    checkingDust:   '* [Gary]: "Meow... (Checking kelp...)"',
  },

  actions: {
    revive:           'REVIVE',
    reviveTooltip:    'Rescue tab back into active Chrome window',
    purge:            'CHUM',
    purgeTooltip:     "Feed permanently to Plankton's Chum Bucket",
    sweep:            'NET',
    sweepTooltip:     'Catch tab with Jellyfish Net and send to Locker',
    erect:            'VAULT',
    erectAction:      (n) => `VAULT (${n})`,
    bury:             'VAULT',
    collapse:         (n) => `PACK (${n})`,
    collapseAll:      (n) => `PACK ALL (${n})`,
    cremate:          (n) => `CHUM (${n})`,
    keepLabel:        'KEEP:',
    keepTooltip:      'Number of newest tabs to keep stocked',
    selectAll:        '[ALL]',
    deselect:         (n) => `[CLEAR (${n})]`,
    resurrectSession: 'REVIVE',
    purgeSession:     'CHUM',
    reviveAll:        'REVIVE ALL',
    simulateDev:      '[DEV: +4D]',
    footerResting:    '* FORMULAS IN SAFE',
    footerLocal:      '* 100% LOCAL BIKINI DB',
  },

  catacombs: {
    tombstoneSectionTitle:   'SECRET FORMULAS',
    tombstoneMonumentsLabel: (n) => `(${n} vaults)`,
    temporalSectionTitle:    'TIME CAPSULES',
    temporalBadge:           '(Shift)',
    tabUnitSingular:         'tab',
    tabUnitPlural:           'tabs',
    nameTombstonePrompt:     (n) => `* NAME VAULT (${n} TABS):`,
    placeholderTombstone:    'formula title...',
  },

  cls: {
    shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',
    box:   'border border-[#38BDF8] bg-white shadow-pixel rounded-sm',
    card:  'border border-[#38BDF8]/60 bg-white hover:bg-[#F0F9FF] hover:border-[#0284C7] transition-all rounded-sm shadow-pixel',
    btn: {
      // SpongeBob Yellow CTA: crisp yellow with dark readable text and subtle border
      revive: 'font-pixel text-[8px] bg-[#F9E03B] hover:bg-[#ffe853] text-[#1e1b18] border border-[#d6be1a] font-bold px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Plankton Chum Bucket red danger action
      danger: 'font-pixel text-[8px] bg-rose-600 hover:bg-rose-700 text-white font-bold border border-rose-700 px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Ocean Blue Jellyfish Net utility action
      sweep:  'font-pixel text-[8px] bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold border border-[#0284C7] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Subtle secondary button
      subtle: 'font-pixel text-[8px] bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] hover:text-[#0C4A6E] border border-[#38BDF8]/60 px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
      // Krabby formula action button
      accent: 'font-pixel text-[8px] bg-[#F9E03B] hover:bg-[#ffe853] text-[#1e1b18] font-bold border border-[#d6be1a] px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-pixel',
    },
    badge: {
      alive:     'text-[#16A34A] border-[#16A34A]/50 bg-[#DCFCE7]',
      aging:     'text-[#E11D48] border-[#E11D48]/50 bg-[#FFE4E6]',
      forgotten: 'text-[#D97706] border-[#D97706]/50 bg-[#FEF3C7]',
      dead:      'text-[#0284C7] border-[#0284C7]/50 bg-[#E0F2FE]',
    },
    badgeBase: 'font-pixel text-[7px] border px-1 py-0.5 rounded-none whitespace-nowrap',
    text: {
      pixel:    'font-pixel',
      dialogue: 'font-dialogue text-base leading-snug',
      sans:     'font-sans text-xs',
      muted:    'text-[#475569]',
      label:    'font-pixel text-[8px] text-[#0284C7] tracking-wider',
    },
  },

  characters: [
    {
      name: 'SpongeBob SquarePants',
      role: 'Master Fry Cook',
      quote: "I'm ready, I'm ready, I'm ready!",
      icon: '🧽',
    },
    {
      name: 'Patrick Star',
      role: 'Best Friend & Philosopher',
      quote: 'The inner machinations of my mind are an enigma.',
      icon: '⭐',
    },
    {
      name: 'Squidward Tentacles',
      role: 'Cashier & Clarinet Virtuoso',
      quote: 'Nobody gives a care about the fate of labor as long as they can get their instant gratification.',
      icon: '🐙',
    },
    {
      name: 'Mr. Eugene H. Krabs',
      role: 'Krusty Krab Proprietor',
      quote: 'Argh argh argh! Money money money!',
      icon: '🦀',
    },
    {
      name: 'Sheldon J. Plankton',
      role: 'Owner of the Chum Bucket',
      quote: 'I went to college! Goodbye everyone, I will remember you all in therapy.',
      icon: '🦠',
    },
    {
      name: 'Gary the Snail',
      role: 'Loyal Pet Snail',
      quote: 'Meow.',
      icon: '🐌',
    },
    {
      name: 'Sandy Cheeks',
      role: 'Texas Scientist & Karate Champion',
      quote: "Don't you dare mess with Texas!",
      icon: '🐿️',
    },
    {
      name: 'French Narrator',
      role: 'Ocean Chronicler',
      quote: 'Three hours later...',
      icon: '🌊',
    },
  ],
};
