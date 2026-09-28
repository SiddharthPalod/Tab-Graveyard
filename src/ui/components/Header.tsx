import React from 'react';
import type { LevelInfo } from '../../core/telemetry';
import { TypewriterText } from './RPGPrimitives';
import { IconSkull, IconSkullhead } from './GameIcons';

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
  // Dynamic persona copy
  let dynamicQuote = '* The graveyard is quiet... peace reigns.';
  if (awakeningMessage) {
    dynamicQuote = `* ${awakeningMessage}`;
  } else if (livingCount >= 18) {
    dynamicQuote = `* The dead are restless. Your RAM weeps with ${livingCount} open tabs.`;
  } else if (buriedCount > 30) {
    dynamicQuote = `* A vast sea of ${buriedCount} souls sleeps beneath the soil.`;
  } else if (buriedCount > 10) {
    dynamicQuote = `* Restless spirits wander. ${buriedCount} tabs laid to rest.`;
  } else if (buriedCount > 0) {
    dynamicQuote = `* Seeing ${buriedCount} buried tabs fills you with DETERMINATION.`;
  }

  return (
    <div className="shrink-0 bg-rpg-dark-gray/90 border border-rpg-border rounded-sm p-2 shadow-pixel">
      {/* Top Stat Row */}
      <div className="grid grid-cols-[1fr_auto] items-center w-full">
        <div className="flex items-center gap-1.5">
          <IconSkull className="text-sm text-rpg-yellow shrink-0" />
          <span className="font-pixel text-[8.5px] text-rpg-yellow tracking-wide">
            GRAVEYARD
          </span>
        </div>

        <div
          className="ml-auto flex items-center gap-1 bg-rpg-surface px-1.5 py-0.5 border border-rpg-border text-[7px] font-pixel text-rpg-monster cursor-help"
          title={`Level ${levelInfo.level}: ${levelInfo.title} (${levelInfo.currentXp}/${levelInfo.nextLevelXp} XP)`}
        >
          <span>LV{levelInfo.level}</span>
          <span className="text-rpg-light-gray hidden sm:inline">
            {levelInfo.title}
          </span>
          <div className="w-8 h-1 bg-rpg-bg border border-rpg-border shrink-0 ml-0.5">
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
        <div className="font-pixel flex flex-row items-center gap-1 text-[0.5rem] text-rpg-mid-gray">
          <IconSkullhead className="text-sm  shrink-0" />
          <p>{buriedCount}</p>
        </div>
      </div>
    </div>
  );
};
