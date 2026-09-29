import React from 'react';
import type { LevelInfo } from '../../core/telemetry';
import { TypewriterText } from './RPGPrimitives';
import { IconSkull, IconSkullhead, IconAnchor, IconBurger } from './GameIcons';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '../themes/useTheme';

interface HeaderProps {
  buriedCount:       number;
  livingCount:       number;
  awakeningMessage?: string;
  levelInfo?:        LevelInfo;
}

export const Header: React.FC<HeaderProps> = ({
  buriedCount,
  livingCount,
  awakeningMessage,
  levelInfo = { level: 1, title: 'Novice Gravedigger', currentXp: 0, nextLevelXp: 50, progress: 0 },
}) => {
  const { theme } = useTheme();

  // Dynamic persona copy driven by active theme
  const dynamicQuote = theme.header.getQuote({
    buriedCount,
    livingCount,
    awakeningMessage,
  });

  const displayLevelTitle = theme.header.levelTitle(levelInfo.level, levelInfo.title);
  const isSponge = theme.id === 'spongebob';

  return (
    <div className="shrink-0 bg-rpg-dark-gray border border-rpg-border rounded-sm p-2 shadow-pixel">
      {/* Top Stat Row */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Left: Theme Title & Dynamic Theme Selector Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isSponge ? (
            <IconAnchor className="text-sm text-[#0284C7] shrink-0" />
          ) : (
            <IconSkull className="text-sm text-rpg-yellow shrink-0" />
          )}
          <span className="font-pixel text-[8.5px] text-rpg-yellow tracking-wide">
            {theme.header.title}
          </span>

          <ThemeSelector />
        </div>

        {/* Right: Level Progression Indicator (Always visible!) */}
        <div
          className="flex items-center gap-1 bg-rpg-surface px-1.5 py-0.5 border border-rpg-border text-[7px] font-pixel text-rpg-monster cursor-help shrink-0 max-w-[210px]"
          title={`Level ${levelInfo.level}: ${displayLevelTitle} (${levelInfo.currentXp}/${levelInfo.nextLevelXp} XP)`}
        >
          <span>LV{levelInfo.level}</span>
          <span className="text-rpg-light-gray truncate max-w-[95px] font-sans text-[10.5px] font-medium leading-none">
            {displayLevelTitle}
          </span>
          <div className="w-6 h-1 bg-rpg-bg border border-rpg-border shrink-0 ml-0.5">
            <div
              className="h-full bg-rpg-monster transition-all"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Typewriter Quote (Compact 1-line ticker) */}
      <div className="mt-1 pt-1 border-t border-rpg-border/60 flex items-center justify-between text-xs min-h-4.5">
        <div className="font-dialogue text-[13px] text-rpg-light-gray truncate max-w-85">
          <TypewriterText text={dynamicQuote} speed={25} />
        </div>
        <div className="font-pixel flex flex-row items-center gap-1 text-[0.5rem] text-rpg-mid-gray shrink-0">
          {isSponge ? (
            <IconBurger className="text-sm shrink-0 text-[#0284C7]" />
          ) : (
            <IconSkullhead className="text-sm shrink-0" />
          )}
          <p>{buriedCount}</p>
        </div>
      </div>
    </div>
  );
};
