import React from 'react';
import { formatRelativeTime, formatActiveDuration } from '../../core/lifecycle';
import { ARCHETYPE_META, TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { useTheme } from '../themes/useTheme';

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
  const { theme } = useTheme();

  const isDead = tab.status === 'dead';
  const badgeCls = `${theme.cls.badgeBase} ${theme.cls.badge[tab.status]}`;
  const archMeta = theme.archetypes?.[tab.archetype] || ARCHETYPE_META[tab.archetype];
  const metamorphosis = tab.metamorphosis;

  const DeadHoverIcon = theme.icons.tabDeadHover;
  const AliveHoverIcon = theme.icons.tabAliveHover;
  const ReviveIcon = theme.icons.revive;
  const PurgeIcon = theme.icons.purge;
  const SweepIcon = theme.icons.sweep;

  return (
    <div
      onClick={() => onToggleSelect?.(tab.cleanUrl)}
      onMouseEnter={() => onHover(tab.cleanUrl)}
      onMouseLeave={() => onHover(null)}
      className={`
        group relative p-2 mb-1.5 transition-all duration-150 rounded-sm border
        cursor-pointer
        ${isSelected
          ? 'bg-rpg-surface border-rpg-yellow shadow-pixel'
          : isHovered
          ? 'bg-rpg-surface/90 border-rpg-mid-gray/80 shadow-pixel'
          : 'bg-rpg-dark-gray/95 border-rpg-border/90'
        }
      `}
    >
      {/* Title & Metadata row */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">

          {/* Select toggle / Soul icon */}
          {onToggleSelect ? (
            <span
              className="
                font-pixel text-[8px] select-none mt-0.5 shrink-0
                px-1 py-0.5 text-rpg-yellow
                bg-rpg-bg border border-rpg-border
              "
              title="Select for tombstone collapse"
            >
              {isSelected ? '■' : '□'}
            </span>
          ) : (
            <span className="flex items-center justify-center w-4 mt-0.5 shrink-0">
              {isHovered && isDead ? (
                <DeadHoverIcon className="text-xs text-rpg-monster animate-ghost" />
              ) : isHovered ? (
                <AliveHoverIcon className="text-[10px] text-rpg-soul animate-pulse" />
              ) : (
                <span className="font-pixel text-[7.5px] text-rpg-mid-gray">
                  *
                </span>
              )}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h2
              className={`font-sans text-[12.5px] font-medium leading-snug truncate ${
                isSelected
                  ? 'text-rpg-yellow font-semibold'
                  : 'text-rpg-white'
              }`}
              title={tab.title}
            >
              {tab.title || 'Untitled Encounter'}
            </h2>

            <p className="font-sans text-[10.5px] text-rpg-light-gray truncate">
              <span className="text-rpg-white/90 font-normal">
                {tab.domain || 'local'}
              </span>

              <span className="mx-1 text-rpg-mid-gray">•</span>

              <span>
                FOCUS: {formatActiveDuration(tab.totalActiveTime)}
              </span>
            </p>
          </div>
        </div>

        {/* Informational Badges */}
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {metamorphosis && (
            <span
              className={`${theme.cls.badgeBase} ${metamorphosis.badgeCls}`}
              title={metamorphosis.flavor}
            >
              {metamorphosis.icon} {metamorphosis.title}
            </span>
          )}

          {archMeta && (
            <span
              className={`${theme.cls.badgeBase} ${archMeta.badgeCls}`}
              title={`${archMeta.name}: ${archMeta.description}`}
            >
              {archMeta.icon} {archMeta.name}
            </span>
          )}

          <span className={badgeCls}>
            {theme.statusLabels[tab.status]}
          </span>
        </div>
      </div>

      {/* Stats & Solid Action Buttons Row */}
      <div className="flex items-center justify-between pt-1.5 border-t border-rpg-border/60">
        <span className="font-sans text-[10.5px] text-rpg-light-gray/70 truncate max-w-[220px]">
          {isDead ? theme.labels.stateDead : theme.labels.stateAlive}{' '}
          {formatRelativeTime(tab.lastActivatedAt)}{' '}
          (Visits: {tab.activationCount})
        </span>

        {/* Solid Action Buttons */}
        <div
          className="flex gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {isDead ? (
            <>
              <button
                onClick={() => actions.revive(tab)}
                className={theme.cls.btn.revive}
                title={theme.actions.reviveTooltip}
              >
                <ReviveIcon className="text-xs" />
                <span>{theme.actions.revive}</span>
              </button>

              <button
                onClick={() => actions.purge(tab.cleanUrl)}
                className={theme.cls.btn.danger}
                title={theme.actions.purgeTooltip}
              >
                <PurgeIcon className="text-xs" />
                <span>{theme.actions.purge}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => actions.sweep(tab)}
              className={theme.cls.btn.sweep}
              title={theme.actions.sweepTooltip}
            >
              <SweepIcon className="text-xs" />
              <span>{theme.actions.sweep}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};