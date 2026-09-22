/**
 * src/ui/tokens.ts
 *
 * Factory Pattern — single source of truth for ALL Tailwind class strings.
 *
 * DESIGNER WORKFLOW: To change any visual, edit ONLY this file.
 * All colors reference semantic `rpg-*` tokens defined in index.css.
 */

export const cls = {
  // ── Layout shells ──────────────────────────────────────────────────────────
  /** Outer popup wrapper (using RPG layout) */
  shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-dialogue select-none overflow-hidden p-2 gap-2',

  // ── Undertale dialogue boxes ───────────────────────────────────────────────
  /** Heavy bordered box (used for header, empty states) */
  box:   'border-[3px] border-rpg-white bg-rpg-bg shadow-pixel',
  /** Lighter tab card border */
  card:  'border-2 border-rpg-mid-gray bg-rpg-dark-gray',

  // ── Battle action buttons ─────────────────────────────────────────────────
  btn: {
    /** Top-level battle menu buttons (GRAVEYARD / LIVING) */
    battle:  'group relative font-pixel text-[9px] border-2 border-rpg-mid-gray text-rpg-light-gray bg-rpg-bg px-2.5 py-1.5 uppercase inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-rpg-white hover:text-rpg-yellow shadow-pixel hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-100',
    /** Standard white action button */
    white:   'font-pixel text-[8px] border-2 border-rpg-mid-gray text-rpg-white bg-rpg-bg px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer hover:border-rpg-white hover:text-rpg-yellow shadow-pixel hover:shadow-none transition-all duration-100',
    /** Destructive red button */
    danger:  'font-pixel text-[8px] border-2 border-rpg-soul text-rpg-soul bg-rpg-bg px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer hover:bg-rpg-soul hover:text-rpg-bg shadow-pixel hover:shadow-none transition-all duration-100',
  },

  // ── Status badges ──────────────────────────────────────────────────────────
  badge: {
    alive:    'text-rpg-magic border-rpg-magic',
    aging:    'text-rpg-yellow border-rpg-yellow',
    forgotten:'text-rpg-determination border-rpg-determination',
    dead:     'text-rpg-mid-gray border-rpg-mid-gray',
  } as const,

  /** Shared badge wrapper */
  badgeBase: 'font-pixel text-[7.5px] border-2 px-1 py-px whitespace-nowrap',

  // ── Typography helpers ─────────────────────────────────────────────────────
  text: {
    pixel:    'font-pixel',
    dialogue: 'font-dialogue text-lg leading-tight',
    muted:    'text-rpg-light-gray',
    label:    'font-pixel text-[8px] text-rpg-yellow tracking-wider',
  },
} as const;

/**
 * Status badge label and icon — maps TabStatus → display string.
 */
export const STATUS_LABELS: Record<string, string> = {
  alive:     '♥ ALIVE',
  aging:     '♦ DUST',
  forgotten: '♠ COBWEB',
  dead:      '♣ BURIED',
};

/**
 * Undertale dialogue quotes — change copy here, propagates everywhere.
 */
export const QUOTES = {
  determination: (n: number) =>
    `* Seeing ${n} buried tabs fills you with DETERMINATION.`,
  clean:          "* Despite everything, it's still clean.",
  emptyGraveyard: "* The ruins are silent. No tabs buried yet.",
  emptyLiving:    "* No active tabs detected in the underground.",
  emptyCatacombs: "* The catacombs are quiet. No tombstones erected.",
  noResults:      "* But nobody came.",
  hintBuried:     "* (Close any tab in Chrome to banish it here.)",
  hintCatacombs:  "* (Collapse tabs from LIVING to store entire sessions here.)",
  checkingDust:   "* (Checking the dust...)",
} as const;
