/**
 * src/ui/tokens.ts
 *
 * Factory Pattern — single source of truth for ALL Tailwind class strings.
 * Refined for legibility, reduced nesting, and solid primary actions.
 */

export const cls = {
  // ── Layout shells ──────────────────────────────────────────────────────────
  /** Outer popup wrapper */
  shell: 'flex flex-col w-popup h-popup bg-rpg-bg text-rpg-white font-sans select-none overflow-hidden p-2 gap-1.5',

  // ── Surface Cards (Fill over outline) ──────────────────────────────────────
  /** Heavy bordered box (used for dialogs, empty states) */
  box:   'border border-rpg-border bg-rpg-dark-gray/95 shadow-pixel rounded-sm',
  /** Subdued card fill with gentle border */
  card:  'border border-rpg-border bg-rpg-dark-gray/90 hover:bg-rpg-surface hover:border-rpg-light-gray/40 transition-all rounded-sm shadow-pixel',

  // ── Solid Action Buttons (Clear Visual Weight) ──────────────────────────────
  btn: {
    /** Solid primary action: Revive / Resurrect (Emerald / Green) */
    revive: 'font-pixel text-[8px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
    /** Solid critical action: Purge / Cremate (Crimson / Rose) */
    danger: 'font-pixel text-[8px] bg-rose-900/90 hover:bg-rose-700 text-rose-100 border border-rose-500/40 px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
    /** Solid utility action: Sweep (Ethereal Blue / Purple) */
    sweep:  'font-pixel text-[8px] bg-indigo-950 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 px-2 py-1 uppercase inline-flex items-center gap-1 cursor-pointer transition-all rounded-none shadow-pixel hover:translate-y-[1px]',
    /** Subtle secondary button */
    subtle: 'font-pixel text-[8px] bg-rpg-surface hover:bg-rpg-surface-hover text-rpg-light-gray hover:text-rpg-white border border-rpg-border px-1.5 py-1 inline-flex items-center gap-1 cursor-pointer transition-all rounded-none',
  },

  // ── Status badges (Muted Informational Pills) ───────────────────────────────
  badge: {
    alive:     'text-rpg-heart border-rpg-heart/40 bg-rpg-heart/10',
    aging:     'text-rpg-yellow border-rpg-yellow/40 bg-rpg-yellow/10',
    forgotten: 'text-rpg-determination border-rpg-determination/40 bg-rpg-determination/10',
    dead:      'text-rpg-light-gray border-rpg-border bg-rpg-surface',
  } as const,

  /** Shared badge wrapper (Muted outline pill) */
  badgeBase: 'font-pixel text-[7px] border px-1 py-0.5 rounded-none whitespace-nowrap',

  // ── Typography helpers ─────────────────────────────────────────────────────
  text: {
    pixel:    'font-pixel',
    dialogue: 'font-dialogue text-base leading-snug',
    sans:     'font-sans text-xs',
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
 * Undertale dialogue quotes — responsive copy.
 */
export const QUOTES = {
  determination: (n: number) =>
    `* Seeing ${n} buried tabs fills you with DETERMINATION.`,
  clean:          "* The graveyard is quiet... peace reigns.",
  emptyGraveyard: "* The ruins are silent. No tabs buried yet.",
  emptyLiving:    "* No active tabs detected in the underground.",
  emptyCatacombs: "* The catacombs are quiet. No tombstones erected.",
  noResults:      "* But nobody came.",
  hintBuried:     "* (Close any tab in Chrome to banish it here.)",
  hintCatacombs:  "* (Collapse tabs from LIVING to store entire sessions here.)",
  checkingDust:   "* (Checking the dust...)",
} as const;
