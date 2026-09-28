import React from 'react';
import { cls, STATUS_LABELS } from '../tokens';
import { formatRelativeTime, formatActiveDuration } from '../../core/lifecycle';
import { ARCHETYPE_META, TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { IconHeart, IconRevive, IconPurge, IconSweep, IconGhost } from './GameIcons';

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
      className={`
        group relative p-2 mb-1.5 transition-all duration-150 rounded-sm border
        ${isSelected
          ? 'bg-rpg-surface border-rpg-yellow shadow-pixel'
          : isHovered
          ? 'bg-rpg-surface/90 border-rpg-mid-gray/80 shadow-pixel'
          : 'bg-rpg-dark-gray/80 border-rpg-border/90'
        }
      `}
    >
      {/* Title & Metadata row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          {/* Select toggle or Soul icon */}
          {onToggleSelect ? (
            <button
              onClick={() => onToggleSelect(tab.cleanUrl)}
              className="font-pixel text-[8px] select-none mt-0.5 shrink-0 px-1 py-0.5 text-rpg-yellow hover:text-white cursor-pointer bg-rpg-bg border border-rpg-border"
              title="Select for tombstone collapse"
            >
              {isSelected ? '■' : '□'}
            </button>
          ) : (
            <span className="flex items-center justify-center w-4 mt-0.5 shrink-0">
              {isHovered && isDead ? (
                <IconGhost className="text-xs text-rpg-monster animate-ghost" />
              ) : isHovered ? (
                <IconHeart className="text-[10px] text-rpg-soul animate-pulse" />
              ) : (
                <span className="font-pixel text-[7.5px] text-rpg-mid-gray">*</span>
              )}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h2
              className={`font-sans text-[12.5px] font-medium leading-snug truncate ${
                isSelected ? 'text-rpg-yellow font-semibold' : isHovered ? 'text-white' : 'text-slate-200'
              }`}
              title={tab.title}
            >
              {tab.title || 'Untitled Encounter'}
            </h2>
            <p className="font-sans text-[10.5px] text-rpg-light-gray/80 truncate">
              <span className="text-slate-300 font-normal">{tab.domain || 'local'}</span>
              <span className="mx-1 text-rpg-mid-gray">•</span>
              <span>FOCUS: {formatActiveDuration(tab.totalActiveTime)}</span>
            </p>
          </div>
        </div>

        {/* Informational Badges (Muted, non-competing) */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
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

      {/* Stats & Solid Action Buttons Row */}
      <div className="flex items-center justify-between pt-1.5 border-t border-rpg-border/60">
        <span className="font-sans text-[10.5px] text-rpg-light-gray/70 truncate max-w-[220px]">
          {isDead ? 'Buried' : 'Resting'} {formatRelativeTime(tab.lastActivatedAt)} (Visits: {tab.activationCount})
        </span>

        {/* Solid Action Buttons */}
        <div className="flex gap-1.5 shrink-0">
          {isDead ? (
            <>
              <button
                onClick={() => actions.revive(tab)}
                className={cls.btn.revive}
                title="Revive tab back into active Chrome window"
              >
                <IconRevive className="text-xs" />
                <span>REVIVE</span>
              </button>
              <button
                onClick={() => actions.purge(tab.cleanUrl)}
                className={cls.btn.danger}
                title="Permanently remove from Graveyard"
              >
                <IconPurge className="text-xs" />
                <span>PURGE</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => actions.sweep(tab)}
              className={cls.btn.sweep}
              title="Close tab in Chrome and bury into Graveyard"
            >
              <IconSweep className="text-xs" />
              <span>SWEEP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
