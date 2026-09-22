import React from 'react';
import { QUOTES } from '../tokens';
import { DialogueBox, TypewriterText } from './RPGPrimitives';
import { IconSkull } from './GameIcons';

interface HeaderProps {
  buriedCount:       number;
  livingCount:       number;
  awakeningMessage?: string;
}

export const Header: React.FC<HeaderProps> = ({
  buriedCount,
  livingCount,
  awakeningMessage,
}) => {
  const maxSafe   = 15;
  const hpPercent = Math.max(10, Math.min(100,
    Math.round(((maxSafe - Math.max(0, livingCount - 5)) / maxSafe) * 100),
  ));

  const quote = awakeningMessage 
    ? awakeningMessage 
    : buriedCount === 0 
      ? QUOTES.clean 
      : QUOTES.determination(buriedCount);

  return (
    <DialogueBox className="mb-2 shrink-0 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-pixel text-[10px] text-rpg-yellow">
          <IconSkull className="text-xl" />
          <span className="mt-1">TAB GRAVEYARD</span>
        </div>
        <div className="font-pixel text-[10px] text-rpg-soul mt-1">LV 1</div>
      </div>
      
      <div className="text-rpg-white font-dialogue text-lg leading-snug min-h-[44px]">
        {awakeningMessage ? (
          <TypewriterText text={`* ${awakeningMessage}`} className="text-rpg-yellow font-bold" />
        ) : (
          <TypewriterText text={quote} />
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-2 border-t-2 border-rpg-mid-gray">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] text-rpg-white mt-0.5">RAM-HP</span>
          <div className="w-24 h-3 bg-rpg-soul border-2 border-rpg-white flex shadow-[2px_2px_0_#555555]">
            <div className="h-full bg-rpg-yellow transition-all" style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="font-pixel text-[8px] text-rpg-light-gray ml-1">{livingCount} OPEN</span>
        </div>
        <div className="flex items-center gap-1 font-pixel text-[8px] text-rpg-monster">
          <IconSkull className="text-xs" />
          <span className="mt-0.5">{buriedCount} DEAD</span>
        </div>
      </div>
    </DialogueBox>
  );
};
