import React from 'react';
import type { LevelInfo } from '../../core/telemetry';
import { TypewriterText } from './RPGPrimitives';
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
  const HeaderIcon = theme.icons.header;
  const CounterIcon = theme.icons.counter;

  return (
    <div className="shrink-0 bg-rpg-dark-gray border border-rpg-border rounded-sm p-2 shadow-pixel">
      {/* Top Stat Row */}
      <div className="flex items-center justify-between gap-1 w-full">
        {/* Left: Theme Title & Dynamic Theme Selector Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          <HeaderIcon className="text-sm text-rpg-yellow shrink-0" />
          <span className={theme.header.titleCls || 'font-pixel text-[11px] text-rpg-yellow tracking-wide leading-none'}>
            {theme.header.title}
          </span>

          <ThemeSelector />
        </div>

        {/* Right: Level Progression Indicator (Always visible!) */}
        <div
          className="flex items-center gap-1 bg-rpg-surface px-1.5 py-0.5 border border-rpg-border/80 text-[7.5px] font-pixel text-rpg-monster cursor-help shrink-0 max-w-[170px]"
          title={`Level ${levelInfo.level}: ${displayLevelTitle} (${levelInfo.currentXp}/${levelInfo.nextLevelXp} XP)`}
        >
          <span className="font-bold tracking-tight">LV{levelInfo.level}</span>
          <span className="text-rpg-light-gray truncate max-w-[75px] font-sans text-[9.5px] font-medium leading-none">
            {displayLevelTitle}
          </span>
          <div className="w-4 h-1 bg-rpg-bg border border-rpg-border/60 shrink-0 ml-0.5">
            <div
              className="h-full bg-rpg-monster transition-all"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Typewriter Quote (Compact 1-line ticker) */}
      <div className="mt-1 pt-1 border-t border-rpg-border/60 flex items-center justify-between text-xs min-h-4.5">
        <div className="font-dialogue text-[11.5px] text-rpg-light-gray truncate max-w-85 leading-none">
          <TypewriterText text={dynamicQuote} speed={25} />
        </div>
        <div className="font-pixel flex flex-row items-center gap-1 text-[8px] text-rpg-mid-gray shrink-0">
          <CounterIcon className="text-xs shrink-0" />
          <p>{buriedCount}</p>
        </div>
      </div>
    </div>
  );
};
