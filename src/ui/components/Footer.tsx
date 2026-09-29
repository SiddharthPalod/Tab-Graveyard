import React from 'react';
import { ActivePage } from './BattleNav';
import { useTheme } from '../themes/useTheme';

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
}) => {
  const { theme } = useTheme();
  const ReviveIcon = theme.icons.revive;

  return (
    <footer className="flex items-center justify-between border-t border-rpg-border/70 pt-1.5 mt-auto shrink-0 text-[8px]">
      {activePage === 'graveyard' && hasBuried ? (
        <button onClick={onReviveAll} className={theme.cls.btn.revive} title="Revive the most recent buried tabs">
          <ReviveIcon className="text-xs" />
          <span>{theme.actions.reviveAll}</span>
        </button>
      ) : activePage === 'living' && hasLiving ? (
        <button onClick={onSimulateAging} className={theme.cls.btn.subtle} title="Simulate 4 days passing to test tab aging">
          <span>{theme.actions.simulateDev}</span>
        </button>
      ) : activePage === 'catacombs' && hasTombstones ? (
        <span className="font-pixel text-[7px] text-rpg-yellow leading-tight">{theme.actions.footerResting}</span>
      ) : (
        <span className="font-pixel text-[7px] text-rpg-light-gray/70 leading-tight">{theme.actions.footerLocal}</span>
      )}
      <span className="font-pixel text-[7px] text-rpg-light-gray/40">v1.0.0</span>
    </footer>
  );
};
