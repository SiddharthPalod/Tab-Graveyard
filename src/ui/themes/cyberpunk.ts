import { ThemePersonality } from './types';
import {
  IconWireframeGlobe,
  IconProcessor,
  IconRetroController,
  IconCyberEye,
  IconCassette,
  IconFloppy,
  IconLaser,
} from '../components/GameIcons';

export const cyberpunkTheme: ThemePersonality = {
  id: 'cyberpunk',
  name: 'Neo Arcade',
  shortName: 'CYBER',
  tagline: "Wake Up, Netrunner • Neo-Tokyo '84",
  icon: '👾',

  header: {
    title: 'NEO-GRID',
    subtitle: 'Sector 07 • Cyberdeck OS',
    titleCls: 'font-pixel text-[11px] text-rpg-yellow tracking-wider leading-none',
    levelTitle: (level, _defaultTitle) => {
      const titles = [
        'Script Kiddie',     // LV1
        'Deck Jockey',       // LV2
        'Grid Runner',       // LV3
        'Code Samurai',      // LV4
        'ICE Breaker',       // LV5
        'Ghost Operator',    // LV6
        'Cyber Overlord',    // LV7
        'AI Deity',          // LV8+
      ];
      const index = Math.max(0, Math.min(level - 1, titles.length - 1));
      return titles[index];
    },
    getQuote: ({ buriedCount, livingCount, awakeningMessage }) => {
      if (awakeningMessage) {
        return `* [AI Voice]: "${awakeningMessage}"`;
      }
      if (livingCount >= 18) {
        return `* [Deck]: "${livingCount} threads hot! Heat critical!"`;
      }
      if (buriedCount > 30) {
        return `* [Operator]: "${buriedCount} dumps flatlined."`;
      }
      if (buriedCount > 10) {
        return `* [Fixer]: "${buriedCount} cold dumps cached."`;
      }
      if (buriedCount > 0) {
        return `* [System]: "${buriedCount} threads in scrap buffer."`;
      }
      return '* [AI Voice]: "Cyberspace buffer calm."';
    },
  },

  nav: {
    graveyard: { label: 'SCRAP', tooltip: 'Flatlined memory dumps & dumped threads' },
    catacombs: { label: 'ICE VAULT', tooltip: 'Encrypted memory modules & backup ROMs' },
    living:    { label: 'SYNAPSE', tooltip: 'Active neural net threads running in Chrome' },
  },

  statusLabels: {
    alive:     '⚡ LIVE',
    aging:     '▲ DECAY',
    forgotten: '■ STALE',
    dead:      '☠ DUMP',
  },

  mirrorTitle: 'SYNAPSE MATRIX',
  archetypes: {
    phantom: {
      id:          'phantom',
      icon:        '⚡',
      name:        'GLITCH',
      quote:       '* A transient pulse in the matrix, vanished into the wire.',
      description: 'Viewed < 15s. A cursory ghost ping.',
      badgeCls:    'text-[#00F0FF] border-[#00F0FF]/50 bg-[#00F0FF]/10',
    },
    zombie: {
      id:          'zombie',
      icon:        '👾',
      name:        'MALWARE',
      quote:       '* Rapid erratic voltage spikes overloading the buffer!',
      description: 'Visited 3+ times, but < 10s each. Sensory overload.',
      badgeCls:    'text-[#FF007F] border-[#FF007F]/50 bg-[#FF007F]/10',
    },
    artifact: {
      id:          'artifact',
      icon:        '💾',
      name:        'DATA-CORE',
      quote:       '* Proprietary source code locked in cold cryo-storage.',
      description: 'Heavy past engagement, dormant 3+ days. Core asset.',
      badgeCls:    'text-[#FFE600] border-[#FFE600]/50 bg-[#FFE600]/10',
    },
    mayfly: {
      id:          'mayfly',
      icon:        '📡',
      name:        'PING',
      quote:       '* A single packet echo, discarded upon reception.',
      description: 'Quick redirect or query, idle for hours.',
      badgeCls:    'text-[#00F0FF] border-[#00F0FF]/50 bg-[#00F0FF]/10',
    },
    grimoire: {
      id:          'grimoire',
      icon:        '🕹️',
      name:        'FIRMWARE',
      quote:       '* Pinned system protocol powering the whole cyberdeck.',
      description: 'Core documentation and reference manual.',
      badgeCls:    'text-[#C084FC] border-[#C084FC]/50 bg-[#C084FC]/10',
    },
    abyss: {
      id:          'abyss',
      icon:        '🌐',
      name:        'CYBERSPACE',
      quote:       '* Lost deep in an infinite recursive neon hyper-tunnel.',
      description: 'Endless data streams and media vortexes.',
      badgeCls:    'text-[#FF2A85] border-[#FF2A85]/50 bg-[#FF2A85]/10',
    },
    hoard: {
      id:          'hoard',
      icon:        '📼',
      name:        'CACHE',
      quote:       '* Bundles of neural ROMs accumulating in buffer memory.',
      description: 'Items dormant for days in local buffers.',
      badgeCls:    'text-[#00FF88] border-[#00FF88]/50 bg-[#00FF88]/10',
    },
    spark: {
      id:          'spark',
      icon:        '🔥',
      name:        'OVERCLOCK',
      quote:       '* CPU pinned at 99%! Neural synchronization peak!',
      description: 'Active workhorse currently engaging user focus.',
      badgeCls:    'text-[#FFE600] border-[#FFE600]/50 bg-[#FFE600]/10',
    },
  },

  icons: {
    header:         IconWireframeGlobe,
    counter:        IconProcessor,
    navGraveyard:   IconLaser,
    navCatacombs:   IconFloppy,
    navLiving:      IconCyberEye,
    revive:         IconRetroController,
    purge:          IconLaser,
    sweep:          IconCassette,
    vault:          IconFloppy,
    cremate:        IconLaser,
    temporal:       IconWireframeGlobe,
    emptyGraveyard: IconLaser,
    emptyCatacombs: IconFloppy,
    emptyLiving:    IconCyberEye,
    tabDeadHover:   IconLaser,
    tabAliveHover:  IconCyberEye,
  },

  palette: {
    bg:                  '#090814', // Deep synth midnight void
    white:               '#F1F5F9', // Ice white high-contrast text (18.2:1 contrast)
    darkGray:            '#131124', // Cyber card surface
    surface:             '#1A1733', // Neon grid surface
    surfaceHover:        '#252147', // Active glow hover
    border:              '#00F0FF', // Electric neon cyan border (12.4:1 contrast)
    midGray:             '#818CF8', // Indigo-400 cyber steel (7.6:1 contrast)
    lightGray:           '#94A3B8', // Slate-400 secondary text (7.3:1 contrast)
    soul:                '#FF007F', // Neon hot magenta / laser pink (6.5:1 contrast)
    determination:       '#FFE600', // Neon arcade laser yellow (13.5:1 contrast)
    monster:             '#C084FC', // Synthwave neon violet (7.4:1 contrast)
    magic:               '#00F0FF', // Electric cyber cyan (12.4:1 contrast)
    heart:               '#00FF88', // Acid matrix green (13.1:1 contrast)
    yellow:              '#FFE600', // Neon laser yellow (13.5:1 contrast)
    shadow:              '2px 2px 0 #FF007F', // Iconic neon hot pink 80s arcade shadow
    shadowHover:         '1px 1px 0 #00F0FF', // Cyan hover shadow
    scrollbarTrack:      '#090814',
    scrollbarThumb:      '#FF007F',
    scrollbarThumbHover: '#00F0FF',
  },

  fonts: {
    pixel:    "'Orbitron', monospace, sans-serif",
    dialogue: "'VT323', monospace",
    sans:     "'Inter', system-ui, -apple-system, sans-serif",
  },

  labels: {
    stateDead:         'Flatlined',
    stateAlive:        'Live',
    collapseArchetype: 'TO ICE VAULT',
  },

  quotes: {
    determination: (n: number) =>
      `* Salvaging ${n} flatlined cyber-threads fills you with OVERCLOCK.`,
    clean:          '* [AI Voice]: "All neural memory buffers clean and nominal."',
    emptyGraveyard: '* [Deck]: "No flatlined processes in scrap heap."',
    emptyLiving:    '* [Deck]: "Zero live neural connections. Connect deck."',
    emptyCatacombs: '* [ICE]: "No encrypted ROMs locked in the ICE vault."',
    noResults:      '* [Scanner]: "Zero matching data signatures in Neo-Tokyo."',
    hintBuried:     '* (Kill Chrome tabs to dump memory to scrap heap.)',
    hintCatacombs:  '* (Encapsulate SYNAPSE threads into encrypted ICE ROMs.)',
    checkingDust:   '* [Terminal]: "Scanning optical buses for bitrot..."',
  },

  actions: {
    revive:           'BOOT',
    reviveTooltip:    'Jack process back into live Chrome window',
    purge:            'DELETE',
    purgeTooltip:     'Permanently incinerate memory thread from disk',
    sweep:            'ICE',
    sweepTooltip:     'Isolate thread into cold scrap storage',
    erect:            'ENCRYPT',
    erectAction:      (n) => `ENCRYPT (${n})`,
    bury:             'ENCRYPT',
    collapse:         (n) => `PACK (${n})`,
    collapseAll:      (n) => `PACK ALL (${n})`,
    cremate:          (n) => `WIPE (${n})`,
    keepLabel:        'BUFFER:',
    keepTooltip:      'Amount of newest threads preserved in memory',
    selectAll:        '[Select All]',
    deselect:         (n) => `[CLEAR (${n})]`,
    resurrectSession: 'REBOOT',
    purgeSession:     'WIPE',
    reviveAll:        'REBOOT ALL',
    simulateDev:      '[DEV: +4D]',
    footerResting:    '* ROMS ENCRYPTED IN ICE',
    footerLocal:      '* 100% AIR-GAPPED DECK',
  },

  catacombs: {
    tombstoneSectionTitle:   'ENCRYPTED ICE ROMS',
    tombstoneMonumentsLabel: (n) => `(${n} ROMs)`,
    temporalSectionTitle:    'CRASH LOG SNAPSHOTS',
    temporalBadge:           '(Dump)',
    tabUnitSingular:         'thread',
    tabUnitPlural:           'threads',
    nameTombstonePrompt:     (n) => `* ENCRYPT ICE ROM (${n} THREADS):`,
    placeholderTombstone:    'rom codename...',
  },

  cls: {
    shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',
    box:   'border border-[#00F0FF] bg-[#131124] shadow-pixel rounded-none',
    card:  'border border-[#00F0FF]/40 bg-[#131124] hover:bg-[#1A1733] hover:border-[#FF007F] transition-all rounded-none shadow-pixel',
    btn: {
      // Electric Cyan primary button with dark text (14.2:1 contrast!)
      revive: 'font-pixel text-[10px] bg-[#00F0FF] hover:bg-[#5CF7FF] text-[#05050A] font-bold border border-[#00C4D4] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Neon hot magenta danger button with white text (5.04:1 contrast!)
      danger: 'font-pixel text-[10px] bg-[#D90368] hover:bg-[#FF007F] text-white font-bold border border-[#FF007F] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Synthwave violet sweep button with white text (5.5:1 contrast!)
      sweep:  'font-pixel text-[10px] bg-[#7928CA] hover:bg-[#9042E8] text-white font-bold border border-[#5E17A8] px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
      // Subtle neon surface button with electric cyan text (10.2:1 contrast!)
      subtle: 'font-pixel text-[10px] bg-[#1A1733] hover:bg-[#252147] text-[#00F0FF] hover:text-white border border-[#00F0FF]/50 px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
      // Laser cyan call to action (14.2:1 contrast!)
      accent: 'font-pixel text-[10px] bg-[#00F0FF] hover:bg-[#5CF7FF] text-[#05050A] font-bold border border-[#00C4D4] px-2.5 py-1.5 inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap shadow-pixel',
    },
    badge: {
      alive:     'text-[#00FF88] border-[#00FF88]/50 bg-[#00FF88]/10',
      aging:     'text-[#FFE600] border-[#FFE600]/50 bg-[#FFE600]/10',
      forgotten: 'text-[#FF007F] border-[#FF007F]/50 bg-[#FF007F]/10',
      dead:      'text-[#00F0FF] border-[#00F0FF]/50 bg-[#00F0FF]/10',
    },
    badgeBase: 'font-pixel text-[9px] border px-1.5 py-0.5 rounded-none whitespace-nowrap',
    text: {
      pixel:    'font-pixel',
      dialogue: 'font-dialogue text-base leading-snug',
      sans:     'font-sans text-xs',
      muted:    'text-[#94A3B8]', // 7.3:1 contrast on dark
      label:    'font-pixel text-[9.5px] text-[#00F0FF] tracking-wider',
    },
  },

  characters: [
    {
      name: 'K3Z-9 "Glitch"',
      role: 'Renegade Netrunner',
      quote: 'If ICE exists, it was meant to be shattered.',
      icon: '👾',
    },
    {
      name: 'Vektor 84',
      role: 'Arcade Fixer & Ripperdoc',
      quote: 'New chrome, high baud, zero questions.',
      icon: '🕹️',
    },
    {
      name: 'AURA-01',
      role: 'Sentient Cyberdeck AI',
      quote: 'All systems green. Overclocking neural pathways.',
      icon: '🌐',
    },
  ],
};
