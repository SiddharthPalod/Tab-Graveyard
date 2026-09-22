import React from 'react';
import { PixelButton } from './RPGPrimitives';
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
  <div className="flex items-center justify-between border-t-[2px] border-rpg-mid-gray pt-2 mt-2 shrink-0">
    {activePage === 'graveyard' && hasBuried ? (
      <PixelButton onClick={onReviveAll} className="!px-1 !py-0.5 text-[8px]">
        REVIVE ALL
      </PixelButton>
    ) : activePage === 'living' && hasLiving ? (
      <PixelButton onClick={onSimulateAging} className="!border-rpg-yellow !text-rpg-yellow text-[8px] !px-1 !py-0.5" title="Simulate 4 days passing to test tab aging">
        [DEV: +4 DAYS]
      </PixelButton>
    ) : activePage === 'catacombs' && hasTombstones ? (
      <span className="font-pixel text-[8px] text-rpg-yellow leading-tight">* SESSIONS RESTING</span>
    ) : (
      <span className="font-pixel text-[8px] text-rpg-light-gray leading-tight">* ALL LOCAL</span>
    )}
    <span className="font-pixel text-[8px] text-rpg-mid-gray">v1.0.0</span>
  </div>
);

