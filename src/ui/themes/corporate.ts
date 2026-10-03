import { ThemePersonality } from './types';
import {
  IconCorpFolder,
  IconCorpLayers,
  IconCorpArchive,
  IconCorpRestore,
  IconCorpTrash,
  IconCorpClose,
  IconCorpClock,
  IconCorpInbox,
  IconCorpCheck,
  IconCorpActivity,
  IconCorpGlobe,
} from '../components/GameIcons';

export const corporateTheme: ThemePersonality = {
  id: 'corporate',
  name: 'Corporate / Clean',
  shortName: 'WORKSPACE',
  tagline: 'No persona • Clean tab management',
  icon: '📁',

  header: {
    title: 'TAB MANAGER',
    subtitle: 'Clean Session & Tab Management',
    titleCls: 'font-sans text-[10px] font-bold text-rpg-yellow uppercase tracking-wider leading-none',
    levelTitle: (level, _defaultTitle) => `Tier ${level}`,
    getQuote: ({ buriedCount, livingCount, awakeningMessage }) => {
      if (awakeningMessage) {
        return awakeningMessage;
      }
      if (livingCount >= 18) {
        return `${livingCount} tabs open. Review active tabs.`;
      }
      if (buriedCount > 30) {
        return `${buriedCount} tabs archived. Clean workspace.`;
      }
      if (buriedCount > 0) {
        return `${buriedCount} archived, ${livingCount} open.`;
      }
      return `${livingCount} open tabs. Workspace clean.`;
    },
  },

  nav: {
    graveyard: { label: 'CLOSED', tooltip: 'Recently closed tabs' },
    catacombs: { label: 'FOLDERS', tooltip: 'Saved tab groups & session folders' },
    living:    { label: 'OPEN', tooltip: 'Active open tabs in Chrome' },
  },

  statusLabels: {
    alive:     'OPEN',
    aging:     'INACTIVE',
    forgotten: 'STALE',
    dead:      'CLOSED',
  },

  mirrorTitle: 'USAGE ANALYTICS',
  archetypes: {
    phantom: {
      id:          'phantom',
      icon:        '🔍',
      name:        'QUICK LOOKUP',
      quote:       'Visited briefly (< 15s) for a quick reference check.',
      description: 'Brief lookup, not retained.',
      badgeCls:    'text-[#3C4043] border-[#DADCE0] bg-[#F1F3F4]',
    },
    zombie: {
      id:          'zombie',
      icon:        '🔄',
      name:        'TASK SWITCH',
      quote:       'Frequent short visits during task switching.',
      description: 'Visited multiple times for brief checks.',
      badgeCls:    'text-[#C5221F] border-[#F28B82] bg-[#FCE8E6]',
    },
    artifact: {
      id:          'artifact',
      icon:        '📑',
      name:        'DOCUMENTATION',
      quote:       'High-engagement reference tab kept open long-term.',
      description: 'High reading time, preserved across sessions.',
      badgeCls:    'text-[#137333] border-[#81C995] bg-[#E6F4EA]',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '⏱️',
      name:        'TRANSIENT',
      quote:       'Single-visit tab read once and dismissed.',
      description: 'One-time lookup, idle.',
      badgeCls:    'text-[#1A73E8] border-[#8AB4F8] bg-[#E8F0FE]',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '📌',
      name:        'CORE PIN',
      quote:       'Primary reference or dashboard pinned for daily use.',
      description: 'Consistently active workspace anchor.',
      badgeCls:    'text-[#1A73E8] border-[#8AB4F8] bg-[#EEF2FF]',
    },
    abyss: {
      id:          'abyss',
      icon:        '🔬',
      name:        'RESEARCH THREAD',
      quote:       'Deep research thread with numerous interrelated tabs.',
      description: 'Extended exploration or reading branch.',
      badgeCls:    'text-[#9334E6] border-[#D7AEFB] bg-[#F3E8FD]',
    },
    hoard: {
      id:          'hoard',
      icon:        '📥',
      name:        'BACKLOG',
      quote:       'Queued tab accumulated and pending review.',
      description: 'Unopened or inactive backlog tab.',
      badgeCls:    'text-[#B06000] border-[#FDD663] bg-[#FEF7E0]',
    },
    spark: {
      id:          'spark',
      icon:        '⚡',
      name:        'ACTIVE TASK',
      quote:       'Tab currently in active progress.',
      description: 'Current focus task tab.',
      badgeCls:    'text-[#1A73E8] border-[#8AB4F8] bg-[#E8F0FE]',
    },
  },

  icons: {
    header:         IconCorpLayers,
    counter:        IconCorpActivity,
    navGraveyard:   IconCorpArchive,
    navCatacombs:   IconCorpFolder,
    navLiving:      IconCorpGlobe,
    revive:         IconCorpRestore,
    purge:          IconCorpTrash,
    sweep:          IconCorpClose,
    vault:          IconCorpFolder,
    cremate:        IconCorpTrash,
    temporal:       IconCorpClock,
    emptyGraveyard: IconCorpInbox,
    emptyCatacombs: IconCorpFolder,
    emptyLiving:    IconCorpGlobe,
    tabDeadHover:   IconCorpRestore,
    tabAliveHover:  IconCorpCheck,
  },

  palette: {
    bg:                  '#F8F9FA', // Clean whitish-grey background (Google Chrome surface)
    white:               '#202124', // Primary high-contrast charcoal text (15.5:1 on card)
    darkGray:            '#FFFFFF', // Pure crisp white card floating on #F8F9FA
    surface:             '#F1F3F4', // Chrome toolbar / light grey fill
    surfaceHover:        '#E8EAED', // Hover surface
    border:              '#DADCE0', // Chrome subtle border line
    midGray:             '#5F6368', // Chrome secondary icon/text
    lightGray:           '#54585B', // Secondary metadata text (7.18:1 AAA on card)
    soul:                '#D93025', // Chrome Red: Danger / Delete
    determination:       '#1A73E8', // Chrome Google Blue: Primary actions
    monster:             '#5F6368', // Neutral secondary
    magic:               '#1A73E8', // Google Blue
    heart:               '#188038', // Google Green
    yellow:              '#1A73E8', // Accent blue
    shadow:              '0 1px 2px 0 rgba(60, 64, 67, 0.15), 0 1px 3px 1px rgba(60, 64, 67, 0.08)',
    shadowHover:         '0 1px 3px 0 rgba(60, 64, 67, 0.20), 0 2px 6px 2px rgba(60, 64, 67, 0.12)',
    scrollbarTrack:      '#F1F3F4',
    scrollbarThumb:      '#DADCE0',
    scrollbarThumbHover: '#BDC1C6',
  },

  fonts: {
    pixel:    "'Inter', system-ui, -apple-system, sans-serif",
    dialogue: "'Inter', system-ui, -apple-system, sans-serif",
    sans:     "'Inter', system-ui, -apple-system, sans-serif",
  },

  labels: {
    stateDead:         'Closed',
    stateAlive:        'Open',
    collapseArchetype: 'SAVE TO FOLDER',
  },

  quotes: {
    determination:  (n: number) => `Session history: ${n} closed tabs recorded.`,
    clean:          'Workspace clean. No open tabs.',
    emptyGraveyard: 'No closed tabs in history.',
    emptyLiving:    'No active tabs open.',
    emptyCatacombs: 'No saved folders created yet.',
    noResults:      'No matching tabs found.',
    hintBuried:     '(Closed tabs will appear here automatically.)',
    hintCatacombs:  '(Group tabs into permanent folders or review closed sessions.)',
    checkingDust:   'Scanning tab state...',
  },

  actions: {
    revive:           'RESTORE',
    reviveTooltip:    'Reopen tab in browser',
    purge:            'DELETE',
    purgeTooltip:     'Permanently remove from history',
    sweep:            'CLOSE',
    sweepTooltip:     'Close active tab in browser',
    erect:            'SAVE FOLDER',
    erectAction:      (n) => `SAVE FOLDER (${n})`,
    bury:             'SAVE FOLDER',
    collapse:         (n) => `SAVE FOLDER (${n})`,
    collapseAll:      (n) => `SAVE ALL (${n})`,
    cremate:          (n) => `DELETE (${n})`,
    keepLabel:        'KEEP:',
    keepTooltip:      'Number of active tabs to keep open',
    selectAll:        '[Select All]',
    deselect:         (n) => `[CLEAR (${n})]`,
    resurrectSession: 'RESTORE',
    purgeSession:     'DELETE',
    reviveAll:        'RESTORE ALL',
    simulateDev:      '[DEV: +4D]',
    footerResting:    '* SAVED IN FOLDERS',
    footerLocal:      '* 100% PRIVATE LOCAL STORAGE',
  },

  catacombs: {
    tombstoneSectionTitle:   'SAVED FOLDERS',
    tombstoneMonumentsLabel: (n) => `(${n} folders)`,
    temporalSectionTitle:    'CLOSED SESSIONS',
    temporalBadge:           '(Session)',
    tabUnitSingular:         'tab',
    tabUnitPlural:           'tabs',
    nameTombstonePrompt:     (n) => `FOLDER NAME (${n} TABS):`,
    placeholderTombstone:    'folder name...',
  },

  cls: {
    shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',
    box:   'border border-[#DADCE0] bg-rpg-dark-gray shadow-sm rounded-sm',
    card:  'border border-[#DADCE0] bg-rpg-dark-gray hover:bg-[#F8F9FA] hover:border-[#1A73E8] transition-all rounded-sm shadow-sm',
    btn: {
      revive: 'font-sans text-[10px] font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white border border-[#1A73E8] px-2 py-0.5 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-sm shadow-sm hover:translate-y-[1px]',
      danger: 'font-sans text-[10px] font-semibold bg-[#D93025] hover:bg-[#B3261E] text-white border border-[#D93025] px-2 py-0.5 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-sm shadow-sm hover:translate-y-[1px]',
      sweep:  'font-sans text-[10px] font-semibold bg-[#5F6368] hover:bg-[#3C4043] text-white border border-[#5F6368] px-2 py-0.5 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-sm shadow-sm hover:translate-y-[1px]',
      subtle: 'font-sans text-[10px] font-medium bg-[#FFFFFF] hover:bg-[#F1F3F4] text-[#3C4043] border border-[#DADCE0] px-1.5 py-0.5 inline-flex items-center gap-1 cursor-pointer transition-all rounded-sm',
      accent: 'font-sans text-[10px] font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white border border-[#1A73E8] px-2.5 py-1 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap rounded-sm shadow-sm',
    },
    badge: {
      alive:     'text-[#137333] border-[#CEEAD6] bg-[#E6F4EA]',
      aging:     'text-[#B06000] border-[#FEEFC3] bg-[#FEF7E0]',
      forgotten: 'text-[#5F6368] border-[#DADCE0] bg-[#F1F3F4]',
      dead:      'text-[#C5221F] border-[#FAD2CF] bg-[#FCE8E6]',
    },
    badgeBase: 'inline-flex items-center gap-0.5 px-1 py-0.2 rounded-sm border font-sans text-[9px] font-medium',
    text: {
      pixel:    'font-sans font-semibold text-[11px] tracking-normal',
      dialogue: 'font-sans text-[11px] text-[#3C4043] leading-relaxed',
      sans:     'font-sans text-xs',
      muted:    'font-sans text-[10.5px] text-[#5F6368]',
      label:    'font-sans text-[9px] font-semibold uppercase tracking-wider text-[#5F6368]',
    },
  },
};
