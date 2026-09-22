import React from 'react';
import { cls, STATUS_LABELS } from '../tokens';
import { formatRelativeTime, formatActiveDuration } from '../../core/lifecycle';
import { ARCHETYPE_META, TabViewModel } from '../../core/behavior';
import type { TabActions } from '../../store/useTabs';
import { PixelPanel, PixelButton } from './RPGPrimitives';
import { IconHeart, IconRevive, IconPurge, IconSweep } from './GameIcons';

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
    <PixelPanel
      onMouseEnter={() => onHover(tab.cleanUrl)}
      onMouseLeave={() => onHover(null)}
      className={`mb-2 transition-colors ${
        isSelected
          ? 'border-rpg-yellow bg-rpg-dark-gray'
          : isHovered
          ? 'border-rpg-white'
          : 'border-rpg-mid-gray'
      }`}
      shadow={isHovered}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-1.5 min-w-0 flex-1">
          {/* Select toggle or Soul icon */}
          {onToggleSelect ? (
            <button
              onClick={() => onToggleSelect(tab.cleanUrl)}
              className="font-pixel text-[8px] select-none mt-1 shrink-0 px-0.5 text-rpg-yellow hover:text-rpg-white cursor-pointer"
              title="Select for tombstone collapse"
            >
              {isSelected ? '[X]' : '[ ]'}
            </button>
          ) : (
            <span className={`flex items-center justify-center w-4 mt-1 shrink-0 ${isHovered ? 'text-rpg-soul animate-pulse' : 'text-rpg-mid-gray'}`}>
              {isHovered ? <IconHeart className="text-[10px]" /> : <span className="font-pixel text-[8px]">*</span>}
            </span>
          )}

          <div className="min-w-0">
            <h2
              className={`font-dialogue text-lg leading-tight truncate ${
                isSelected ? 'text-rpg-yellow font-bold' : isHovered ? 'text-rpg-white font-bold' : 'text-rpg-light-gray'
              }`}
              title={tab.title}
            >
              {tab.title || 'Untitled Encounter'}
            </h2>
            <p className="font-dialogue text-sm text-rpg-mid-gray truncate max-w-[200px]">
              {tab.domain || 'local'} • ACTIVE: {formatActiveDuration(tab.totalActiveTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 mt-1">
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
      <div className="flex items-center justify-between pt-2 border-t-2 border-rpg-mid-gray text-xs text-rpg-light-gray">
        <span className="font-dialogue text-sm">
          * {isDead ? 'Buried' : 'Resting'}: {formatRelativeTime(tab.lastActivatedAt)} (Visits: {tab.activationCount})
        </span>
        <div className="flex gap-1.5 shrink-0">
          {isDead ? (
            <>
              <PixelButton onClick={() => actions.revive(tab)} className="gap-1 flex items-center">
                <IconRevive />
                <span>[REVIVE]</span>
              </PixelButton>
              <PixelButton onClick={() => actions.purge(tab.cleanUrl)} className="!border-rpg-soul !text-rpg-soul hover:!bg-rpg-soul hover:!text-rpg-bg gap-1 flex items-center">
                <IconPurge />
                <span>[! PURGE]</span>
              </PixelButton>
            </>
          ) : (
            <PixelButton onClick={() => actions.sweep(tab)} className="gap-1 flex items-center">
              <IconSweep />
              <span>[SWEEP]</span>
            </PixelButton>
          )}
        </div>
      </div>
    </PixelPanel>
  );
};
