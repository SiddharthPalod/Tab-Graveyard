import React from 'react';
import { cls, STATUS_LABELS } from '../tokens';
import { formatRelativeTime, formatActiveDuration } from '../../core/lifecycle';
import { ARCHETYPE_META, TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';

interface TabItemProps {
  tab:             TabViewModel;
  isHovered:       boolean;
  onHover:         (url: string | null) => void;
  actions:         Pick<TabActions, 'revive' | 'purge' | 'sweep'>;
  isSelected?:     boolean;
  onToggleSelect?: (cleanUrl: string) => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  tab,
  isHovered,
  onHover,
  actions,
  isSelected,
  onToggleSelect,
}) => {
  const isDead        = tab.status === 'dead';
  const badgeCls      = `${cls.badgeBase} ${cls.badge[tab.status]}`;
  const archMeta      = ARCHETYPE_META[tab.archetype];
  const metamorphosis = tab.metamorphosis;

  return (
    <div
      onMouseEnter={() => onHover(tab.cleanUrl)}
      onMouseLeave={() => onHover(null)}
      className={`${cls.card} p-2 mb-1.5 transition-colors ${
        isSelected
          ? 'border-ut-lv bg-zinc-950'
          : isHovered
          ? 'border-ut-lv'
          : 'border-ut-text'
      }`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          {/* Select toggle or Soul icon */}
          {onToggleSelect ? (
            <button
              onClick={() => onToggleSelect(tab.cleanUrl)}
              className="font-pixel text-[8px] select-none mt-0.5 shrink-0 px-0.5 text-ut-lv hover:text-white cursor-pointer"
              title="Select for tombstone collapse"
            >
              {isSelected ? '[X]' : '[ ]'}
            </button>
          ) : (
            <span className="font-pixel text-[8px] text-ut-soul select-none mt-0.5 shrink-0">
              {isHovered ? '❤️' : '*'}
            </span>
          )}

          <div className="min-w-0">
            <h2
              className={`font-dialogue text-[15px] leading-tight truncate ${
                isSelected ? 'text-ut-lv font-bold' : isHovered ? 'text-ut-lv' : 'text-ut-text'
              }`}
              title={tab.title}
            >
              {tab.title || 'Untitled Encounter'}
            </h2>
            <p className="font-dialogue text-xs text-zinc-400 truncate max-w-50">
              {tab.domain || 'local'} • ACTIVE: {formatActiveDuration(tab.totalActiveTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {metamorphosis && (
            <span
              className={`${cls.badgeBase} ${metamorphosis.badgeCls}`}
              title={metamorphosis.flavor}
            >
              {metamorphosis.icon} {metamorphosis.title}
            </span>
          )}
          {archMeta && (
            <span
              className={`${cls.badgeBase} ${archMeta.badgeCls}`}
              title={`${archMeta.name}: ${archMeta.description}`}
            >
              {archMeta.icon} {archMeta.name}
            </span>
          )}
          <span className={badgeCls}>{STATUS_LABELS[tab.status]}</span>
        </div>
      </div>

      {/* Stats + actions row */}
      <div className="flex items-center justify-between pt-1 border-t border-ut-muted text-xs text-zinc-400">
        <span className="font-dialogue">
          * {isDead ? 'Buried' : 'Resting'}: {formatRelativeTime(tab.lastActivatedAt)} (Visits: {tab.activationCount})
        </span>
        <div className="flex gap-1.5 shrink-0">
          {isDead ? (
            <>
              <button className={cls.btn.white} onClick={() => actions.revive(tab)}>[❤️ REVIVE]</button>
              <button className={cls.btn.danger} onClick={() => actions.purge(tab.cleanUrl)}>[💔 PURGE]</button>
            </>
          ) : (
            <button className={cls.btn.white} onClick={() => actions.sweep(tab)}>[🧹 SWEEP]</button>
          )}
        </div>
      </div>
    </div>
  );
};
