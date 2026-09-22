/**
 * src/ui/tokens.ts
 *
 * Factory Pattern — single source of truth for ALL Tailwind class strings.
 *
 * DESIGNER WORKFLOW: To change any visual, edit ONLY this file.
 * All colors reference semantic `ut-*` tokens defined in tailwind.config.js.
 *
 * Usage:
 *   import { cls } from '../ui/tokens';
 *   <div className={cls.box}>...</div>
 *   <button className={cls.btn.battle}>ACT</button>
 */

export const cls = {
  // ── Layout shells ──────────────────────────────────────────────────────────
  /** Outer popup wrapper */
  shell: 'flex flex-col w-popup h-popup bg-ut-bg text-ut-text font-dialogue select-none overflow-hidden p-2.5',

  // ── Undertale dialogue boxes ───────────────────────────────────────────────
  /** Heavy bordered box (used for header, empty states) */
  box:   'border-2 border-ut-text bg-ut-bg',
  /** Lighter tab card border */
  card:  'border border-ut-text bg-ut-bg',

  // ── Battle action buttons ─────────────────────────────────────────────────
  btn: {
    /** Top-level battle menu buttons (GRAVEYARD / LIVING) */
    battle:  'font-pixel text-[8.5px] border-2 border-ut-orange text-ut-orange bg-ut-bg px-2.5 py-1.5 uppercase inline-flex items-center justify-center gap-1.5 cursor-pointer hover:border-ut-lv hover:text-ut-lv',
    /** Standard white action button */
    white:   'font-pixel text-[7.5px] border border-ut-text text-ut-text bg-ut-bg px-1.5 py-0.5 inline-flex items-center gap-1 cursor-pointer hover:border-ut-lv hover:text-ut-lv',
    /** Destructive red button */
    danger:  'font-pixel text-[7.5px] border border-red-500 text-red-500 bg-ut-bg px-1.5 py-0.5 inline-flex items-center gap-1 cursor-pointer hover:bg-red-500 hover:text-ut-bg',
  },

  // ── Status badges ──────────────────────────────────────────────────────────
  badge: {
    alive:    'text-ut-alive border-ut-alive',
    aging:    'text-ut-dust border-ut-dust',
    forgotten:'text-ut-cobweb border-ut-cobweb',
    dead:     'text-ut-buried border-ut-muted',
  } as const,

  /** Shared badge wrapper */
  badgeBase: 'font-pixel text-[7.5px] border px-1 py-px whitespace-nowrap',

  // ── Typography helpers ─────────────────────────────────────────────────────
  text: {
    pixel:    'font-pixel',
    dialogue: 'font-dialogue',
    muted:    'text-zinc-400',
    label:    'font-pixel text-[8px] text-ut-lv tracking-wider',
  },
} as const;

/**
 * Status badge label and icon — maps TabStatus → display string.
 * Change labels here to update across the whole app.
 */
export const STATUS_LABELS: Record<string, string> = {
  alive:     '🟢 ALIVE',
  aging:     '🟡 DUST',
  forgotten: '🕸️ COBWEB',
  dead:      '💀 BURIED',
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
