import React from 'react';
import { cls } from '../tokens';
import { ActivePage } from './BattleNav';
import { IconRevive } from './GameIcons';

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
  <footer className="flex items-center justify-between border-t border-rpg-border/70 pt-1.5 mt-auto shrink-0 text-[8px]">
    {activePage === 'graveyard' && hasBuried ? (
      <button onClick={onReviveAll} className={cls.btn.revive} title="Revive the most recent buried tabs">
        <IconRevive className="text-xs" />
        <span>REVIVE ALL</span>
      </button>
    ) : activePage === 'living' && hasLiving ? (
      <button onClick={onSimulateAging} className={cls.btn.subtle} title="Simulate 4 days passing to test tab aging">
        <span>[DEV: +4 DAYS]</span>
      </button>
    ) : activePage === 'catacombs' && hasTombstones ? (
      <span className="font-pixel text-[7px] text-rpg-yellow leading-tight">* SESSIONS RESTING</span>
    ) : (
      <span className="font-pixel text-[7px] text-rpg-light-gray/70 leading-tight">* ALL LOCAL DB</span>
    )}
    <span className="font-pixel text-[7px] text-rpg-light-gray/40">v1.0.0</span>
  </footer>
);
