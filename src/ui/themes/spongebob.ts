import { ThemePersonality } from './types';
import {
  IconAnchor,
  IconBurger,
  IconJellyfish,
  IconFishBucket,
  IconFishingNet,
  IconBubbles,
} from '../components/GameIcons';

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
      badgeCls:    'text-[#0369A1] border-[#0369A1]/40 bg-[#E0F2FE]',
    },
    zombie: {
      id:          'zombie',
      icon:        '🐟',
      name:        'ANCHOVY',
      quote:       '* Clicked in a frantic rush! Meep meep meep!',
      description: 'Visited 3+ times, but < 10s each. Total sensory chaos.',
      badgeCls:    'text-[#1D4ED8] border-[#1D4ED8]/40 bg-[#EFF6FF]',
    },
    artifact: {
      id:          'artifact',
      icon:        '🍔',
      name:        'FORMULA',
      quote:       '* A legendary Krabby Patty secret formula. Keep it safe in the vault.',
      description: 'Heavy engagement in past, now dormant for 3+ days.',
      badgeCls:    'text-[#78350F] border-[#78350F]/40 bg-[#FEF3C7]',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '🫧',
      name:        'BUBBLE',
      quote:       '* A single fleeting inquiry, blown and popped.',
      description: 'Quick redirect or lookup, idle for hours.',
      badgeCls:    'text-[#0369A1] border-[#0369A1]/40 bg-[#F0F9FF]',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '📖',
      name:        'BOATING',
      quote:       '* Mrs. Puff\'s Boating manual consulted and left open forever.',
      description: 'Documentation and references kept as safety blankets.',
      badgeCls:    'text-[#4338CA] border-[#4338CA]/40 bg-[#EEF2FF]',
    },
    abyss: {
      id:          'abyss',
      icon:        '🪼',
      name:        'ROCK BOTTOM',
      quote:       '* A dark, endless feed vortex deep down in Rock Bottom.',
      description: 'Endless feeds and video streams with heavy engagement.',
      badgeCls:    'text-[#6D28D9] border-[#6D28D9]/40 bg-[#F3E8FF]',
    },
    hoard: {
      id:          'hoard',
      icon:        '💰',
      name:        'KRABS DIME',
      quote:       '* Items waiting for a discount that will never arrive.',
      description: 'Shopping carts and price comparisons dormant for days.',
      badgeCls:    'text-[#166534] border-[#166534]/40 bg-[#DCFCE7]',
    },
    spark: {
      id:          'spark',
      icon:        '🧽',
      name:        'READY SPARK',
      quote:       '* Burning bright with pure Fry Cook energy! I\'M READY!',
      description: 'Active workhorse currently being read or edited.',
      badgeCls:    'text-[#854D0E] border-[#854D0E]/40 bg-[#FEF3C7]',
    },
  },

  icons: {
    header:         IconAnchor,
    counter:        IconBurger,
    navGraveyard:   IconAnchor,
    navCatacombs:   IconBurger,
    navLiving:      IconJellyfish,
    revive:         IconBurger,
    purge:          IconFishBucket,
    sweep:          IconFishingNet,
    vault:          IconBurger,
    cremate:        IconFishBucket,
    temporal:       IconBubbles,
    emptyGraveyard: IconAnchor,
    emptyCatacombs: IconBurger,
    emptyLiving:    IconJellyfish,
    tabDeadHover:   IconAnchor,
    tabAliveHover:  IconJellyfish,
  },

  palette: {
    bg:                  '#F0F8FF',
    white:               '#0F172A',
    darkGray:            '#FFFFFF',
    surface:             '#E0F2FE',
    surfaceHover:        '#BAE6FD',
    border:              '#0284C7',
    midGray:             '#7B4B3A',
    lightGray:           '#475569',
    soul:                '#BE123C',
    determination:       '#854D0E',
    monster:             '#6D28D9',
    magic:               '#0369A1',
    heart:               '#166534',
    yellow:              '#854D0E',
    shadow:              '2px 2px 0 rgba(0, 163, 224, 0.35)',
    shadowHover:         '1px 1px 0 rgba(0, 163, 224, 0.35)',
    scrollbarTrack:      '#F0F8FF',
    scrollbarThumb:      '#38BDF8',
    scrollbarThumbHover: '#F9E03B',
  },

  labels: {
    stateDead:         'Sunken',
    stateAlive:        'Swimming',
    collapseArchetype: 'TO VAULT',
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
    box:   'border border-[#0284C7] bg-white shadow-pixel rounded-sm',
    card:  'border border-[#0284C7]/40 bg-white hover:bg-[#F0F9FF] hover:border-[#0284C7] transition-all rounded-sm shadow-pixel',
    btn: {
      // SpongeBob Yellow CTA: #F9E03B background with deep #1E1B18 dark text (12.86:1 contrast ratio!)
      revive: 'font-pixel text-[8px] bg-[#F9E03B] hover:bg-[#ffe853] text-[#1e1b18] border border-[#a16207] font-bold px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Plankton Chum Bucket red danger action: Rose-700 with white text (6.29:1 contrast ratio!)
      danger: 'font-pixel text-[8px] bg-[#BE123C] hover:bg-[#9F1239] text-white font-bold border border-[#9F1239] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Ocean Blue Jellyfish Net utility action: Sky-700 with white text (5.93:1 contrast ratio!)
      sweep:  'font-pixel text-[8px] bg-[#0369A1] hover:bg-[#075985] text-white font-bold border border-[#075985] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Subtle secondary button: Sky-100 bg with Sky-800 text (7.67:1 contrast ratio!)
      subtle: 'font-pixel text-[8px] bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#075985] hover:text-[#0C4A6E] border border-[#0284C7]/60 px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
      // Krabby formula action button: #F9E03B with dark text (12.86:1 contrast ratio!)
      accent: 'font-pixel text-[8px] bg-[#F9E03B] hover:bg-[#ffe853] text-[#1e1b18] font-bold border border-[#a16207] px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-pixel',
    },
    badge: {
      alive:     'text-[#166534] border-[#166534]/50 bg-[#DCFCE7]', // 6.49:1
      aging:     'text-[#9F1239] border-[#9F1239]/50 bg-[#FFE4E6]', // 6.68:1
      forgotten: 'text-[#854D0E] border-[#854D0E]/50 bg-[#FEF3C7]', // 6.15:1
      dead:      'text-[#0369A1] border-[#0369A1]/50 bg-[#E0F2FE]', // 5.17:1
    },
    badgeBase: 'font-pixel text-[7px] border px-1 py-0.5 rounded-none whitespace-nowrap',
    text: {
      pixel:    'font-pixel',
      dialogue: 'font-dialogue text-base leading-snug',
      sans:     'font-sans text-xs',
      muted:    'text-[#475569]', // 7.58:1 on white
      label:    'font-pixel text-[8px] text-[#854D0E] tracking-wider', // 6.85:1 on white
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
