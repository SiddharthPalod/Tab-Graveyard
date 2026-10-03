import { ThemePersonality } from './types';
import {
  IconTemple,
  IconBook,
  IconScroll,
  IconQuill,
  IconCandle,
  IconOwl,
  IconWaxSeal,
} from '../components/GameIcons';

export const academiaTheme: ThemePersonality = {
  id: 'academia',
  name: 'Gothic Library',
  shortName: 'OXFORD',
  tagline: 'Ex Libris • St. Jude Quadrangle',
  icon: '🏛️',

  header: {
    title: 'OXFORD',
    subtitle: 'Bodleian Stacks & Archives',
    titleCls: 'font-pixel text-[11.5px] text-rpg-yellow tracking-wide leading-none',
    levelTitle: (level, _defaultTitle) => {
      const titles = [
        'Scribe',             // LV1
        'Junior Scholar',      // LV2
        'Research Fellow',     // LV3
        'Archivist',           // LV4
        'Reader in Letters',   // LV5
        'Doctor of Canon',     // LV6
        'Dean of Studies',     // LV7
        'Chancellor',          // LV8+
      ];
      const index = Math.max(0, Math.min(level - 1, titles.length - 1));
      return titles[index];
    },
    getQuote: ({ buriedCount, livingCount, awakeningMessage }) => {
      if (awakeningMessage) {
        return `* [Archivist]: "${awakeningMessage}"`;
      }
      if (livingCount >= 18) {
        return `* [Proctor]: "${livingCount} folios clutter the desk."`;
      }
      if (buriedCount > 30) {
        return `* [Head Librarian]: "${buriedCount} folios shelved."`;
      }
      if (buriedCount > 10) {
        return `* [Senior Fellow]: "${buriedCount} folios in canon."`;
      }
      if (buriedCount > 0) {
        return `* [Archivist]: "${buriedCount} folios cataloged."`;
      }
      return '* [Archivist]: "The reading room is silent."';
    },
  },

  nav: {
    graveyard: { label: 'STACKS', tooltip: 'Archived manuscripts & buried volumes' },
    catacombs: { label: 'CODICES', tooltip: 'Bound codices & research compilations' },
    living:    { label: 'DESK', tooltip: 'Active folios open on the reading desk' },
  },

  statusLabels: {
    alive:     '✦ OPEN',
    aging:     '✎ AGING',
    forgotten: '☩ ARCHIVE',
    dead:      '❦ SHELVED',
  },

  mirrorTitle: 'SCHOLAR PROFILES',
  archetypes: {
    phantom: {
      id:          'phantom',
      icon:        '📜',
      name:        'GLOSSA',
      quote:       '* Skimmed briefly in the margin, then left to the dust of time.',
      description: 'Read < 15s. A cursory footnote lookup.',
      badgeCls:    'text-[#44403C] border-[#44403C]/40 bg-[#F5F2EB]',
    },
    zombie: {
      id:          'zombie',
      icon:        '⚔️',
      name:        'POLEMIC',
      quote:       '* Consulted in furious haste during a midnight scholastic debate.',
      description: 'Visited 3+ times, but < 10s each. Agitated dispute.',
      badgeCls:    'text-[#881337] border-[#881337]/40 bg-[#FFF1F2]',
    },
    artifact: {
      id:          'artifact',
      icon:        '📖',
      name:        'CODEX',
      quote:       '* An illuminated manuscript of immense scholarly weight.',
      description: 'Deep engagement in past, dormant 3+ days. Foundational canon.',
      badgeCls:    'text-[#78350F] border-[#78350F]/40 bg-[#FEF3C7]',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '🪶',
      name:        'FOOTNOTE',
      quote:       '* A swift citation lookup, read once and abandoned to silence.',
      description: 'Quick citation or definition, idle for hours.',
      badgeCls:    'text-[#1E3A8A] border-[#1E3A8A]/40 bg-[#EFF6FF]',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '🏛️',
      name:        'TREATISE',
      quote:       '* The master encyclopedia, pinned open as the cornerstone of study.',
      description: 'Documentation and references kept constantly at hand.',
      badgeCls:    'text-[#1E3A8A] border-[#1E3A8A]/40 bg-[#EEF2FF]',
    },
    abyss: {
      id:          'abyss',
      icon:        '🕯️',
      name:        'LABYRINTH',
      quote:       '* Down the rabbit hole into the forbidden reserve library stacks.',
      description: 'Endless intellectual rabbit holes and archival feeds.',
      badgeCls:    'text-[#4C1D95] border-[#4C1D95]/40 bg-[#FAF5FF]',
    },
    hoard: {
      id:          'hoard',
      icon:        '📚',
      name:        'SYLLABUS',
      quote:       '* Reading list piled high for an examination passed long ago.',
      description: 'Piled reading material dormant for days.',
      badgeCls:    'text-[#14532D] border-[#14532D]/40 bg-[#F0FDF4]',
    },
    spark: {
      id:          'spark',
      icon:        '✒️',
      name:        'THESIS',
      quote:       '* Burning the midnight oil! The dissertation is taking shape.',
      description: 'Active workhorse currently being read or edited.',
      badgeCls:    'text-[#78350F] border-[#78350F]/40 bg-[#FEF3C7]',
    },
  },

  icons: {
    header:         IconTemple,
    counter:        IconOwl,
    navGraveyard:   IconScroll,
    navCatacombs:   IconBook,
    navLiving:      IconQuill,
    revive:         IconBook,
    purge:          IconWaxSeal,
    sweep:          IconScroll,
    vault:          IconBook,
    cremate:        IconWaxSeal,
    temporal:       IconCandle,
    emptyGraveyard: IconScroll,
    emptyCatacombs: IconBook,
    emptyLiving:    IconQuill,
    tabDeadHover:   IconCandle,
    tabAliveHover:  IconOwl,
  },

  palette: {
    bg:                  '#F5F2EB', // Warm parchment / linen canvas (gentle on eyes, zero screen glare)
    white:               '#292524', // Stone-800: Deep warm dark espresso ink (14.3:1 contrast on card)
    darkGray:            '#FAF8F5', // Soft warm cream folio card (subtle lift, zero pure-white glare)
    surface:             '#EBE6DA', // Aged vellum surface fill
    surfaceHover:        '#DFD9CA', // Distinct warm vellum hover
    border:              '#A8A29E', // Stone-400: Balanced structural stone neutral border
    midGray:             '#78350F', // Amber-900: Antique leather bronze accent (8.55:1 AAA on card)
    lightGray:           '#57534E', // Stone-600: Sepia secondary text (7.20:1 AAA on card)
    soul:                '#881337', // Rose-900: Oxblood wax seal
    determination:       '#78350F', // Amber-900: Antique bronze
    monster:             '#4C1D95', // Violet-900: Royal Gothic Purple
    magic:               '#1E3A8A', // Blue-900: Bodleian Archival Blue
    heart:               '#14532D', // Green-900: Quadrangle Ivy Green
    yellow:              '#78350F', // Amber-900: Gilded gold foil
    shadow:              '0 1px 2px rgba(41, 37, 36, 0.07), 0 0 0 1px rgba(41, 37, 36, 0.04)',
    shadowHover:         '0 2px 4px rgba(41, 37, 36, 0.10), 0 0 0 1px rgba(41, 37, 36, 0.06)',
    scrollbarTrack:      '#F5F2EB',
    scrollbarThumb:      '#A8A29E',
    scrollbarThumbHover: '#78350F',
  },

  fonts: {
    pixel:    "'MedievalSharp', Georgia, serif",
    dialogue: "'VT323', monospace",
    sans:     "'Inter', system-ui, -apple-system, sans-serif",
  },

  labels: {
    stateDead:         'Shelved',
    stateAlive:        'Studying',
    collapseArchetype: 'TO CODEX',
  },

  quotes: {
    determination: (n: number) =>
      `* Reviewing ${n} archived folios fills you with ERUDITION.`,
    clean:          '* [Archivist]: "The great reading room sits in reverent silence."',
    emptyGraveyard: '* [Archivist]: "The archive stacks are clear. No folios shelved."',
    emptyLiving:    '* [Senior Fellow]: "The mahogany desk is empty. Begin your thesis."',
    emptyCatacombs: '* [Head Librarian]: "The rare book vault has no bound codices."',
    noResults:      '* [Cataloger]: "Zero matching folios in the university card catalog."',
    hintBuried:     '* (Close Chrome tabs to shelve them in the library stacks.)',
    hintCatacombs:  '* (Compile folios from DESK into bound archival codices.)',
    checkingDust:   '* [Archivist]: "Flipping card catalog drawers..."',
  },

  actions: {
    revive:           'RETRIEVE',
    reviveTooltip:    'Retrieve folio back onto active study desk',
    purge:            'DISCARD',
    purgeTooltip:     'Permanently expel folio from university archives',
    sweep:            'SHELVE',
    sweepTooltip:     'Shelve open folio into the library archive stacks',
    erect:            'BIND',
    erectAction:      (n) => `BIND (${n})`,
    bury:             'BIND',
    collapse:         (n) => `BIND (${n})`,
    collapseAll:      (n) => `BIND ALL (${n})`,
    cremate:          (n) => `PULP (${n})`,
    keepLabel:        'KEEP:',
    keepTooltip:      'Number of newest folios to keep in the reading room',
    selectAll:        '[Select All]',
    deselect:         (n) => `[CLEAR (${n})]`,
    resurrectSession: 'RETRIEVE',
    purgeSession:     'DISCARD',
    reviveAll:        'RETRIEVE ALL',
    simulateDev:      '[DEV: +4D]',
    footerResting:    '* CODICES IN VAULT',
    footerLocal:      '* 100% PRIVATE ARCHIVE',
  },

  catacombs: {
    tombstoneSectionTitle:   'BOUND CODICES',
    tombstoneMonumentsLabel: (n) => `(${n} volumes)`,
    temporalSectionTitle:    'SEMESTER ARCHIVES',
    temporalBadge:           '(Session)',
    tabUnitSingular:         'folio',
    tabUnitPlural:           'folios',
    nameTombstonePrompt:     (n) => `* TITLE BOUND VOLUME (${n} FOLIOS):`,
    placeholderTombstone:    'codex title...',
  },

  cls: {
    shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',
    box:   'border border-[#A8A29E] bg-rpg-dark-gray shadow-pixel rounded-sm',
    card:  'border border-[#D6D3D1] bg-rpg-dark-gray hover:bg-rpg-surface hover:border-[#78350F] transition-all rounded-sm shadow-pixel',
    btn: {
      // Antique Leather / Bronze button: Amber-900 bg with #FEF3C7 amber-100 text (7.88:1 contrast!)
      revive: 'font-pixel text-[10px] bg-[#78350F] hover:bg-[#92400E] text-[#FEF3C7] border border-[#451A03] font-bold px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Wax seal red discard button: Rose-900 with #FFF1F2 text (8.9:1 contrast!)
      danger: 'font-pixel text-[10px] bg-[#881337] hover:bg-[#9F1239] text-[#FFF1F2] font-bold border border-[#4C0519] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Archival ink blue shelve button: Blue-900 with #EFF6FF text (11.5:1 contrast!)
      sweep:  'font-pixel text-[10px] bg-[#1E3A8A] hover:bg-[#1E40AF] text-[#EFF6FF] font-bold border border-[#172554] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Subtle linen button: #EBE6DA bg with #292524 text (12.18:1 contrast!)
      subtle: 'font-pixel text-[10px] bg-[#EBE6DA] hover:bg-[#DFD9CA] text-[#292524] border border-[#A8A29E] px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
      // Binding call to action: Amber-900 with #FEF3C7 text (7.88:1 contrast!)
      accent: 'font-pixel text-[10px] bg-[#78350F] hover:bg-[#92400E] text-[#FEF3C7] font-bold border border-[#451A03] px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-pixel',
    },
    badge: {
      alive:     'text-[#14532D] border-[#14532D]/50 bg-[#F0FDF4]', // 8.44:1
      aging:     'text-[#881337] border-[#881337]/50 bg-[#FFF1F2]', // 8.35:1
      forgotten: 'text-[#78350F] border-[#78350F]/50 bg-[#FEF3C7]', // 7.22:1
      dead:      'text-[#1E3A8A] border-[#1E3A8A]/50 bg-[#EFF6FF]', // 10.45:1
    },
    badgeBase: 'font-pixel text-[9px] border px-1.5 py-0.5 rounded-none whitespace-nowrap',
    text: {
      pixel:    'font-pixel',
      dialogue: 'font-dialogue text-base leading-snug',
      sans:     'font-sans text-xs',
      muted:    'text-[#57534E]', // 7.20:1 on card
      label:    'font-pixel text-[9.5px] text-[#78350F] tracking-wider',
    },
  },

  characters: [
    {
      name: 'Dr. Alistair Vance',
      role: 'Master of the Archives',
      quote: 'Silence in the stacks. The manuscripts are sleeping.',
      icon: '🏛️',
    },
    {
      name: 'Brother Thomas',
      role: 'Senior Paleographer',
      quote: 'Every margin gloss tells a secret forgotten by the author.',
      icon: '📜',
    },
    {
      name: 'Eleanor Sterling',
      role: 'Fellow of Classical Epigraphy',
      quote: 'Only primary sources survive the fires of peer review.',
      icon: '✒️',
    },
    {
      name: 'Archibald Crane',
      role: 'Senior University Proctor',
      quote: 'Order on the study tables! Return all folios by sundown.',
      icon: '🕯️',
    },
  ],
};
