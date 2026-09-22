import React from 'react';
import { cls, QUOTES } from '../tokens';

interface HeaderProps {
  buriedCount:       number;
  livingCount:       number;
  awakeningMessage?: string;
}

export const Header: React.FC<HeaderProps> = ({ buriedCount, livingCount, awakeningMessage }) => {
  const maxSafe   = 15;
  const hpPercent = Math.max(10, Math.min(100,
    Math.round(((maxSafe - Math.max(0, livingCount - 5)) / maxSafe) * 100),
  ));

  return (
    <div className={`${cls.box} p-2.5 mb-2`}>
      {/* Title row */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-pixel text-[9px] text-ut-lv tracking-wider">* TAB GRAVEYARD</span>
        <span className="font-pixel text-[9px] text-ut-orange">LV 1</span>
      </div>

      {/* Determination quote or Awakening alert */}
      <p className="font-dialogue text-[15px] leading-snug text-ut-text my-1">
        {awakeningMessage ? (
          <span className="text-ut-lv font-bold">{awakeningMessage}</span>
        ) : buriedCount === 0 ? (
          QUOTES.clean
        ) : (
          <>
            * Seeing <span className="text-ut-lv">{buriedCount}</span> buried tabs fills you with{' '}
            <span className="text-ut-soul font-bold">DETERMINATION</span>.
          </>
        )}
      </p>

      {/* RAM-HP bar row */}
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-ut-muted">
        <div className="flex items-center gap-2">
          <span className="font-pixel text-[8px] text-ut-orange">RAM-HP</span>
          <div className="w-20 h-2.5 bg-ut-hpRed border border-ut-text flex">
            <div className="h-full bg-ut-lv transition-all" style={{ width: `${hpPercent}%` }} />
          </div>
          <span className="font-pixel text-[8px] text-zinc-300">{livingCount} OPEN</span>
        </div>
        <span className="font-pixel text-[8px] text-ut-soul">💀 {buriedCount} DEAD</span>
      </div>
    </div>
  );
};
