import React from 'react';
import { cls } from '../tokens';
import { ActivePage } from './BattleNav';

interface FooterProps {
  activePage:      ActivePage;
  hasBuried:       boolean;
  hasLiving:       boolean;
  hasTombstones:   boolean;
  onReviveAll:     () => void;
  onSimulateAging: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  activePage,
  hasBuried,
  hasLiving,
  hasTombstones,
  onReviveAll,
  onSimulateAging,
}) => (
  <div className="flex items-center justify-between mt-2 pt-2 border-t-2 border-ut-text">
    {activePage === 'graveyard' && hasBuried ? (
      <button onClick={onReviveAll} className={`${cls.btn.white} text-[8px]`}>
        [❤️ REVIVE ALL]
      </button>
    ) : activePage === 'living' && hasLiving ? (
      <button onClick={onSimulateAging} className={`${cls.btn.white} text-[8px] text-ut-lv border-ut-lv`}>
        [⏳ WARP +4 DAYS]
      </button>
    ) : activePage === 'catacombs' && hasTombstones ? (
      <span className="font-pixel text-[8px] text-ut-lv">* BUNDLED SESSIONS RESTING</span>
    ) : (
      <span className="font-pixel text-[8px] text-zinc-500">* EVERYTHING LOCAL</span>
    )}
    <span className="font-pixel text-[8px] text-zinc-500">TAB GRAVEYARD v1.0</span>
  </div>
);
